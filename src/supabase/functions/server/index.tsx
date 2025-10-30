import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2.47.10";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Configure CORS avec options complètes
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Length"],
  maxAge: 86400,
  credentials: false,
}));
app.use("*", logger(console.log));

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

// ===== HEALTH CHECK =====

app.get("/make-server-b90be4d1/health", (c) => {
  console.log("[Health] Health check requested");
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: {
      hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
      hasServiceRole: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    },
  });
});

// Check if user is admin (for diagnostics)
app.get("/make-server-b90be4d1/auth/check-admin", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];

    if (!accessToken) {
      return c.json({ isAdmin: false, error: "No access token" }, 200);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ isAdmin: false, error: "Invalid token or user not found" }, 200);
    }

    const profile = await kv.get(`user:${user.id}`);
    
    return c.json({
      isAdmin: profile?.role === "admin",
      userId: user.id,
      userEmail: user.email,
      role: profile?.role || "none",
    });
  } catch (error: any) {
    return c.json({ isAdmin: false, error: error?.message || "Unknown error" }, 200);
  }
});

// Make current user an admin (for setup/debugging)
app.post("/make-server-b90be4d1/auth/make-admin", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];

    if (!accessToken) {
      return c.json({ error: "No access token" }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Invalid token or user not found" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    // Update profile to make them admin
    profile.role = "admin";
    await kv.set(`user:${user.id}`, profile);

    console.log(`[Admin] User ${user.id} (${user.email}) promoted to admin`);
    
    return c.json({
      success: true,
      message: `User ${user.email} is now an admin`,
      userId: user.id,
      role: "admin",
    });
  } catch (error: any) {
    console.log("Error making user admin:", error?.message || error);
    return c.json({ error: error?.message || "Unknown error" }, 500);
  }
});

// ===== AUTHENTICATION =====

app.post("/make-server-b90be4d1/auth/signup", async (c) => {
  try {
    const formData = await c.req.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const userType = formData.get("userType") as string;
    const name = formData.get("name") as string;
    const pseudo = formData.get("pseudo") as string;
    const profileImage = formData.get(
      "profileImage",
    ) as File | null;

    if (!email || !password || !userType || !name || !pseudo) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } =
      await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name, userType, pseudo },
        email_confirm: true, // Auto-confirm email since email server isn't configured
      });

    if (error) {
      console.log("Error creating user:", error);
      return c.json({ error: error.message }, 400);
    }

    const userId = data.user.id;
    let profileImageUrl = null;

    // Upload profile image if provided
    if (profileImage) {
      try {
        const bucketName = "make-b90be4d1-profile-images";

        // Create bucket if it doesn't exist
        const { data: buckets } =
          await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(
          (bucket) => bucket.name === bucketName,
        );
        if (!bucketExists) {
          await supabase.storage.createBucket(bucketName, {
            public: true,
          });
        }

        // Upload image
        const fileExt = profileImage.name.split(".").pop();
        const fileName = `${userId}.${fileExt}`;
        const arrayBuffer = await profileImage.arrayBuffer();

        const { data: uploadData, error: uploadError } =
          await supabase.storage
            .from(bucketName)
            .upload(fileName, arrayBuffer, {
              contentType: profileImage.type,
              upsert: true,
            });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);
          profileImageUrl = urlData.publicUrl;
        }
      } catch (imageError) {
        console.log("Error uploading image:", imageError);
        // Continue without image
      }
    }

    // Store user profile
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      pseudo,
      profileImageUrl,
      userType,
      subscriptionStatus: "none", // none, active
      subscriptionExpiry: null,
      premiumServices: [], // Array of service IDs
      classification: null, // To be filled via questionnaire
      contractSigned: false, // For premium services contract
      contractSignedAt: null,
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, userId });
  } catch (error) {
    console.log("Signup error:", error);
    return c.json({ error: "Server error during signup" }, 500);
  }
});

// ===== USER PROFILE =====

app.get("/make-server-b90be4d1/profile/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");

    // Profile viewing is public - no authentication required
    // Get profile from KV store
    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      console.log(`Profile not found for userId: ${userId}`);
      return c.json({ error: "Profile not found" }, 404);
    }

    // Get questionnaire responses
    const questionnaire =
      (await kv.get(`questionnaire:${userId}`)) || null;

    return c.json({ profile, questionnaire });
  } catch (error: any) {
    console.log(
      "Error fetching profile:",
      error.message || error,
    );
    return c.json(
      { error: "Server error fetching profile" },
      500,
    );
  }
});

app.put("/make-server-b90be4d1/profile/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];

    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error || user.id !== userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const updates = await c.req.json();
    const currentProfile = await kv.get(`user:${userId}`);

    if (!currentProfile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    const updatedProfile = { ...currentProfile, ...updates };
    await kv.set(`user:${userId}`, updatedProfile);

    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.log("Error updating profile:", error);
    return c.json(
      { error: "Server error updating profile" },
      500,
    );
  }
});

// ===== QUESTIONNAIRES =====

app.post(
  "/make-server-b90be4d1/questionnaire/:userId",
  async (c) => {
    try {
      const userId = c.req.param("userId");
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (!user || error || user.id !== userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const answers = await c.req.json();
      await kv.set(`questionnaire:${userId}`, {
        ...answers,
        submittedAt: new Date().toISOString(),
      });

      // Update classification in user profile
      if (answers.classification) {
        const profile = await kv.get(`user:${userId}`);
        if (profile) {
          profile.classification = answers.classification;
          await kv.set(`user:${userId}`, profile);
        }
      }

      return c.json({ success: true });
    } catch (error) {
      console.log("Error saving questionnaire:", error);
      return c.json(
        { error: "Server error saving questionnaire" },
        500,
      );
    }
  },
);

// ===== SEARCH & MATCHING =====

app.post("/make-server-b90be4d1/search", async (c) => {
  try {
    const {
      userType,
      classification,
      city,
      category,
      name,
      musicGenre,
      priceRange,
    } = await c.req.json();

    // Get all users
    const allUsersData = await kv.getByPrefix("user:");
    if (!allUsersData || !Array.isArray(allUsersData)) {
      console.log("No users found or invalid data format");
      return c.json({ results: [] });
    }

    const users = allUsersData
      .map((item: any) => item.value)
      .filter((u: any) => u && u.id);

    // Filter by criteria
    let filtered = users.filter(
      (u: any) => u.userType === userType,
    );

    if (name) {
      filtered = filtered.filter((u: any) => {
        const nameLower = name.toLowerCase();
        return (
          u.name?.toLowerCase().includes(nameLower) ||
          u.pseudo?.toLowerCase().includes(nameLower)
        );
      });
    }

    if (classification) {
      filtered = filtered.filter(
        (u: any) => u.classification === classification,
      );
    }

    if (city) {
      filtered = filtered.filter((u: any) =>
        u.city?.toLowerCase().includes(city.toLowerCase()),
      );
    }

    if (musicGenre && userType === "artist") {
      filtered = filtered.filter(
        (u: any) => u.musicGenre === musicGenre,
      );
    }

    if (category && userType === "pro") {
      filtered = filtered.filter(
        (u: any) => u.category === category,
      );
    }

    // Only apply price filter for professionals
    if (priceRange && userType === "pro") {
      filtered = filtered.filter((u: any) => {
        if (!u.pricePerHour) return false;
        return (
          u.pricePerHour >= priceRange.min &&
          u.pricePerHour <= priceRange.max
        );
      });
    }

    console.log(
      `Search completed: found ${filtered.length} results for userType=${userType}, name=${name}, classification=${classification}, city=${city}, musicGenre=${musicGenre}, category=${category}`,
    );
    return c.json({ results: filtered });
  } catch (error) {
    console.log("Error searching users:", error);
    return c.json(
      { error: "Server error during search", results: [] },
      500,
    );
  }
});

app.post("/make-server-b90be4d1/profiles/search", async (c) => {
  try {
    const { userType, classification, city, category } =
      await c.req.json();

    // Get all users
    const allUsersData = await kv.getByPrefix("user:");
    if (!allUsersData || !Array.isArray(allUsersData)) {
      console.log("No users found or invalid data format");
      return c.json({ profiles: [] });
    }

    const users = allUsersData
      .map((item: any) => item.value)
      .filter((u: any) => u && u.id);

    // Filter by criteria - IMPORTANT: Only show users with active subscription and complete profiles
    let filtered = users.filter((u: any) => {
      // Must have active subscription
      if (u.subscriptionStatus !== "active") {
        return false;
      }

      // Must have classification (required for all users)
      if (!u.classification) {
        return false;
      }

      // For professionals: must have category and at least one service
      if (u.userType === "pro") {
        if (!u.category) {
          return false;
        }
        if (
          !u.services ||
          !Array.isArray(u.services) ||
          u.services.length === 0
        ) {
          return false;
        }
      }

      return true;
    });

    if (userType) {
      filtered = filtered.filter(
        (u: any) => u.userType === userType,
      );
    }

    if (classification) {
      filtered = filtered.filter(
        (u: any) => u.classification === classification,
      );
    }

    if (city) {
      filtered = filtered.filter((u: any) =>
        u.city?.toLowerCase().includes(city.toLowerCase()),
      );
    }

    if (category) {
      filtered = filtered.filter(
        (u: any) => u.category === category,
      );
    }

    console.log(
      `Profile search completed: found ${filtered.length} results out of ${users.length} total users`,
    );
    return c.json({ profiles: filtered });
  } catch (error) {
    console.log("Error searching profiles:", error);
    return c.json(
      {
        error: "Server error during profile search",
        profiles: [],
      },
      500,
    );
  }
});

// ===== CONTRACT SIGNATURE =====

app.post(
  "/make-server-b90be4d1/contract/:userId/sign",
  async (c) => {
    try {
      const userId = c.req.param("userId");
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (error || !user || user.id !== userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { signature } = await c.req.json();

      if (!signature) {
        return c.json({ error: "Signature required" }, 400);
      }

      // Get user profile
      const profile = await kv.get(`user:${userId}`);
      if (!profile) {
        return c.json({ error: "Profile not found" }, 404);
      }

      // Update profile with contract signature
      await kv.set(`user:${userId}`, {
        ...profile,
        contractSigned: true,
        contractSignedAt: new Date().toISOString(),
        contractSignature: signature,
      });

      // Store contract details
      await kv.set(`contract:${userId}`, {
        userId,
        signature,
        signedAt: new Date().toISOString(),
        contractVersion: "1.0",
        ipAddress: c.req.header("x-forwarded-for") || "unknown",
      });

      // Update premium purchase with contract signature
      const purchasesData = await kv.getByPrefix(
        "premium-purchase:",
      );
      const userPurchases = purchasesData.filter(
        (item: any) =>
          item.value &&
          item.value.userId === userId &&
          !item.value.contractSigned,
      );

      for (const purchaseItem of userPurchases) {
        const purchase = purchaseItem.value;
        await kv.set(`premium-purchase:${purchase.id}`, {
          ...purchase,
          contractSigned: true,
          contractSignedAt: new Date().toISOString(),
        });
      }

      return c.json({ success: true });
    } catch (error) {
      console.log("Error signing contract:", error);
      return c.json(
        { error: "Server error signing contract" },
        500,
      );
    }
  },
);

// ===== SUBSCRIPTION =====

app.post(
  "/make-server-b90be4d1/subscription/:userId",
  async (c) => {
    try {
      const userId = c.req.param("userId");
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (!user || error || user.id !== userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const profile = await kv.get(`user:${userId}`);
      if (!profile) {
        return c.json({ error: "Profile not found" }, 404);
      }

      // Update subscription status
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year subscription

      profile.subscriptionStatus = "active";
      profile.subscriptionExpiry = expiryDate.toISOString();
      await kv.set(`user:${userId}`, profile);

      return c.json({ success: true, expiry: expiryDate });
    } catch (error) {
      console.log("Error activating subscription:", error);
      return c.json(
        { error: "Server error activating subscription" },
        500,
      );
    }
  },
);

// ===== PREMIUM SERVICES =====

// Fonction helper pour mapper les IDs de services Opportunity vers Circuit Artist
function mapServiceIdsToCircuitArtist(opportunityServiceIds: string[]): string[] {
  const serviceMap: Record<string, string> = {
    'test-vision': 'teste_vision',
    'develop-audience': 'developpe_notoriete',
    'create-partnerships': 'booste_carriere',
  };
  
  return opportunityServiceIds.map(id => serviceMap[id] || id);
}

// Fonction pour appeler le webhook Circuit Artist
async function notifyCircuitArtist(email: string, name: string, serviceIds: string[]) {
  try {
    const webhookApiKey = Deno.env.get("WEBHOOK_API_KEY");
    
    if (!webhookApiKey) {
      console.error("[Circuit Artist Webhook] WEBHOOK_API_KEY not configured");
      return { success: false, error: "Webhook API key not configured" };
    }

    const circuitArtistServices = mapServiceIdsToCircuitArtist(serviceIds);
    
    console.log("[Circuit Artist Webhook] Calling webhook for:", { email, name, services: circuitArtistServices });
    
    const response = await fetch(
      'https://vkluaapwntwiqewfwfcj.supabase.co/functions/v1/make-server-2c5f8c62/webhook/subscriptions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          services: circuitArtistServices,
          apiKey: webhookApiKey,
        }),
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      console.error("[Circuit Artist Webhook] Error response:", result);
      return { success: false, error: result.error || "Webhook call failed" };
    }
    
    console.log("[Circuit Artist Webhook] Success:", result);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Circuit Artist Webhook] Exception:", error?.message || error);
    return { success: false, error: error?.message || "Unknown error" };
  }
}

app.post(
  "/make-server-b90be4d1/services/:userId/purchase",
  async (c) => {
    try {
      const userId = c.req.param("userId");
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      console.log(
        "[Services Purchase] Request received for userId:",
        userId,
      );

      if (!accessToken) {
        console.log(
          "[Services Purchase] No access token provided",
        );
        return c.json(
          { error: "Unauthorized - No access token" },
          401,
        );
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);

      if (error) {
        console.log(
          "[Services Purchase] Auth error:",
          error.message,
        );
        return c.json(
          { error: "Unauthorized - Invalid token" },
          401,
        );
      }

      if (!user) {
        console.log("[Services Purchase] No user found");
        return c.json(
          { error: "Unauthorized - User not found" },
          401,
        );
      }

      if (user.id !== userId) {
        console.log("[Services Purchase] User ID mismatch:", {
          tokenUserId: user.id,
          requestUserId: userId,
        });
        return c.json(
          { error: "Unauthorized - User ID mismatch" },
          401,
        );
      }

      const { serviceIds } = await c.req.json(); // Array of service IDs

      if (
        !serviceIds ||
        !Array.isArray(serviceIds) ||
        serviceIds.length === 0
      ) {
        console.log(
          "[Services Purchase] Invalid serviceIds:",
          serviceIds,
        );
        return c.json({ error: "Invalid service IDs" }, 400);
      }

      const profile = await kv.get(`user:${userId}`);
      if (!profile) {
        console.log(
          "[Services Purchase] Profile not found for userId:",
          userId,
        );
        return c.json({ error: "Profile not found" }, 404);
      }

      // Add services to user profile
      profile.premiumServices = [
        ...(profile.premiumServices || []),
        ...serviceIds,
      ];
      profile.hasSignedContract = true; // Marquer que le contrat doit être signé
      await kv.set(`user:${userId}`, profile);

      // Store premium purchase for admin tracking
      const purchaseId = `premium-purchase-${userId}-${Date.now()}`;
      const totalAmount = serviceIds.length * 50; // 50€ per service
      await kv.set(`premium-purchase:${purchaseId}`, {
        id: purchaseId,
        userId,
        userName: profile.name,
        userEmail: profile.email,
        serviceIds,
        totalAmount,
        createdAt: new Date().toISOString(),
        contractSigned: false,
        contractSignedAt: null,
      });

      // Appeler le webhook Circuit Artist pour créer le compte artiste
      console.log("[Services Purchase] Notifying Circuit Artist...");
      const webhookResult = await notifyCircuitArtist(
        profile.email,
        profile.name,
        serviceIds
      );
      
      if (!webhookResult.success) {
        console.error("[Services Purchase] Circuit Artist webhook failed:", webhookResult.error);
        // On continue quand même, le webhook peut être appelé manuellement plus tard
      }

      console.log(
        "[Services Purchase] Success for userId:",
        userId,
        "services:",
        serviceIds,
      );
      return c.json({
        success: true,
        services: profile.premiumServices,
        purchaseId,
        circuitArtistNotified: webhookResult.success,
      });
    } catch (error: any) {
      console.log(
        "[Services Purchase] Error:",
        error?.message || error,
      );
      return c.json(
        { error: "Server error purchasing service" },
        500,
      );
    }
  },
);

// ===== MESSAGING =====

app.post("/make-server-b90be4d1/messages", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];

    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { fromUserId, toUserId, message } =
      await c.req.json();

    if (user.id !== fromUserId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Create conversation ID (sorted to ensure consistency)
    const conversationId = [fromUserId, toUserId]
      .sort()
      .join(":");

    // Get existing messages
    const existingMessages =
      (await kv.get(`messages:${conversationId}`)) || [];

    // Add new message
    const newMessage = {
      id: crypto.randomUUID(),
      fromUserId,
      toUserId,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };

    existingMessages.push(newMessage);
    await kv.set(
      `messages:${conversationId}`,
      existingMessages,
    );

    return c.json({ success: true, message: newMessage });
  } catch (error) {
    console.log("Error sending message:", error);
    return c.json(
      { error: "Server error sending message" },
      500,
    );
  }
});

app.get("/make-server-b90be4d1/messages/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];

    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error || user.id !== userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get all message conversations for this user
    const allMessages = await kv.getByPrefix("messages:");
    const userConversations = allMessages.filter(
      (item: any) => {
        const conversationId = item.key.replace(
          "messages:",
          "",
        );
        return conversationId.includes(userId);
      },
    );

    return c.json({
      conversations: userConversations.map((c: any) => c.value),
    });
  } catch (error) {
    console.log("Error fetching messages:", error);
    return c.json(
      { error: "Server error fetching messages" },
      500,
    );
  }
});

// ===== BOOKINGS =====

app.post("/make-server-b90be4d1/bookings", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];

    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      proUserId,
      artistUserId,
      date,
      duration,
      totalPrice,
    } = await c.req.json();

    if (user.id !== artistUserId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const bookingId = crypto.randomUUID();
    const booking = {
      id: bookingId,
      proUserId,
      artistUserId,
      date,
      duration,
      totalPrice,
      status: "pending", // pending, confirmed, completed, cancelled
      createdAt: new Date().toISOString(),
    };

    await kv.set(`booking:${bookingId}`, booking);

    // Add booking to user's bookings list
    const userBookings =
      (await kv.get(`bookings:user:${artistUserId}`)) || [];
    userBookings.push(bookingId);
    await kv.set(`bookings:user:${artistUserId}`, userBookings);

    const proBookings =
      (await kv.get(`bookings:user:${proUserId}`)) || [];
    proBookings.push(bookingId);
    await kv.set(`bookings:user:${proUserId}`, proBookings);

    return c.json({ success: true, booking });
  } catch (error) {
    console.log("Error creating booking:", error);
    return c.json(
      { error: "Server error creating booking" },
      500,
    );
  }
});

app.get("/make-server-b90be4d1/bookings/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];

    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error || user.id !== userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const bookingIds =
      (await kv.get(`bookings:user:${userId}`)) || [];
    const bookings = await Promise.all(
      bookingIds.map((id: string) => kv.get(`booking:${id}`)),
    );

    return c.json({ bookings: bookings.filter(Boolean) });
  } catch (error) {
    console.log("Error fetching bookings:", error);
    return c.json(
      { error: "Server error fetching bookings" },
      500,
    );
  }
});

// ===== APPLICATIONS =====

app.post("/make-server-b90be4d1/applications", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];

    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { proUserId, applicantId, serviceName, message } =
      await c.req.json();

    if (user.id !== applicantId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get applicant profile for name
    const applicantProfile = await kv.get(
      `user:${applicantId}`,
    );

    const applicationId = crypto.randomUUID();
    const application = {
      id: applicationId,
      proUserId,
      applicantId,
      applicantName: applicantProfile?.name || "Unknown",
      serviceName,
      message,
      status: "pending", // pending, accepted, rejected
      createdAt: new Date().toISOString(),
    };

    await kv.set(`application:${applicationId}`, application);

    // Add application to pro's applications list
    const proApplications =
      (await kv.get(`applications:user:${proUserId}`)) || [];
    proApplications.push(applicationId);
    await kv.set(
      `applications:user:${proUserId}`,
      proApplications,
    );

    return c.json({ success: true, application });
  } catch (error) {
    console.log("Error creating application:", error);
    return c.json(
      { error: "Server error creating application" },
      500,
    );
  }
});

app.get(
  "/make-server-b90be4d1/applications/:userId",
  async (c) => {
    try {
      const userId = c.req.param("userId");
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (!user || error || user.id !== userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const applicationIds =
        (await kv.get(`applications:user:${userId}`)) || [];
      const applications = await Promise.all(
        applicationIds.map((id: string) =>
          kv.get(`application:${id}`),
        ),
      );

      return c.json({
        applications: applications.filter(Boolean),
      });
    } catch (error) {
      console.log("Error fetching applications:", error);
      return c.json(
        { error: "Server error fetching applications" },
        500,
      );
    }
  },
);

app.put(
  "/make-server-b90be4d1/applications/:applicationId/status",
  async (c) => {
    try {
      const applicationId = c.req.param("applicationId");
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (!user || error) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { status } = await c.req.json();

      const application = await kv.get(
        `application:${applicationId}`,
      );
      if (!application) {
        return c.json({ error: "Application not found" }, 404);
      }

      // Only the pro can update the status
      if (application.proUserId !== user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      application.status = status;
      application.updatedAt = new Date().toISOString();
      await kv.set(`application:${applicationId}`, application);

      return c.json({ success: true, application });
    } catch (error) {
      console.log("Error updating application status:", error);
      return c.json(
        { error: "Server error updating application status" },
        500,
      );
    }
  },
);

// ===== AI SCHEDULING =====

app.post(
  "/make-server-b90be4d1/ai-schedule/:userId",
  async (c) => {
    try {
      const userId = c.req.param("userId");
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);

      if (!user || error || user.id !== userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        userType,
        styles,
        categories,
        city,
        projectDescription,
        startDate,
        endDate,
      } = await c.req.json();

      // Search for matching profiles based on criteria
      const allProfiles = await kv.getByPrefix("user:");

      const filteredProfiles = allProfiles.filter(
        (profile: any) => {
          if (profile.userType !== userType) return false;

          // Filter by city if specified
          if (
            city &&
            profile.city &&
            !profile.city
              .toLowerCase()
              .includes(city.toLowerCase())
          ) {
            return false;
          }

          // Filter by categories (for pros)
          if (
            userType === "pro" &&
            categories &&
            categories.length > 0
          ) {
            if (
              !profile.category ||
              !categories.includes(profile.category)
            ) {
              return false;
            }
          }

          // Filter by music styles (for artists)
          if (
            userType === "artist" &&
            styles &&
            styles.length > 0
          ) {
            const questionnaire = kv.get(
              `questionnaire:${profile.id}`,
            );
            if (!questionnaire || !questionnaire.musicStyle)
              return false;
            if (!styles.includes(questionnaire.musicStyle))
              return false;
          }

          return true;
        },
      );

      // Generate a schedule based on the filtered profiles
      const schedule = filteredProfiles
        .slice(0, 10)
        .map((profile: any, index: number) => {
          // Generate dates between startDate and endDate
          const start = new Date(startDate);
          const end = new Date(endDate);
          const daysDiff = Math.floor(
            (end.getTime() - start.getTime()) /
              (1000 * 60 * 60 * 24),
          );
          const randomDay = Math.floor(
            Math.random() * daysDiff,
          );
          const scheduleDate = new Date(start);
          scheduleDate.setDate(
            scheduleDate.getDate() + randomDay,
          );

          return {
            professionalId: profile.id,
            professionalName: profile.name,
            category: profile.category || "Artiste",
            city: profile.city || "Non spécifié",
            date: scheduleDate.toLocaleDateString("fr-FR"),
            price: profile.hourlyRate || 50 + index * 10,
            availableSlots: [
              "09:00 - 12:00",
              "14:00 - 17:00",
              "18:00 - 20:00",
            ],
          };
        });

      const totalPrice = schedule.reduce(
        (sum: number, item: any) => sum + item.price,
        0,
      );

      // Generate AI recommendations based on the project description
      let recommendations = `Votre projet nécessite ${schedule.length} professionnels. `;

      if (
        projectDescription.toLowerCase().includes("tournée")
      ) {
        recommendations +=
          "Pour une tournée, nous recommandons de réserver un vidéaste et un photographe pour capturer chaque date. ";
      }

      if (
        projectDescription.toLowerCase().includes("mixage") ||
        projectDescription.toLowerCase().includes("studio")
      ) {
        recommendations +=
          "Assurez-vous de réserver suffisamment de temps en studio pour le mixage et le mastering. ";
      }

      recommendations += `La période optimale pour votre projet s'étend du ${new Date(startDate).toLocaleDateString("fr-FR")} au ${new Date(endDate).toLocaleDateString("fr-FR")}.`;

      const result = {
        schedule,
        totalPrice,
        recommendations,
        projectDescription,
        period: {
          start: startDate,
          end: endDate,
        },
      };

      // Save the generated schedule
      const scheduleId = crypto.randomUUID();
      await kv.set(`schedule:${scheduleId}`, {
        ...result,
        userId,
        createdAt: new Date().toISOString(),
      });

      return c.json(result);
    } catch (error) {
      console.log("Error generating AI schedule:", error);
      return c.json(
        { error: "Server error generating AI schedule" },
        500,
      );
    }
  },
);

// ===== APPOINTMENTS =====

app.get(
  "/make-server-b90be4d1/appointments/slots",
  async (c) => {
    try {
      // Get all available slots
      const slotsData = await kv.getByPrefix("slot:");
      const slots = slotsData
        .map((item: any) => item.value)
        .filter((slot: any) => slot && slot.id);

      return c.json({ slots });
    } catch (error) {
      console.log("Error fetching slots:", error);
      return c.json(
        { error: "Server error fetching slots", slots: [] },
        500,
      );
    }
  },
);

app.get(
  "/make-server-b90be4d1/appointments/user/:userId",
  async (c) => {
    try {
      const userId = c.req.param("userId");
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (!user || error || user.id !== userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Get user's appointments
      const appointmentIds =
        (await kv.get(`appointments:user:${userId}`)) || [];
      const appointments = await Promise.all(
        appointmentIds.map((id: string) =>
          kv.get(`appointment:${id}`),
        ),
      );

      return c.json({
        appointments: appointments.filter(Boolean),
      });
    } catch (error) {
      console.log("Error fetching user appointments:", error);
      return c.json(
        {
          error: "Server error fetching appointments",
          appointments: [],
        },
        500,
      );
    }
  },
);

app.post(
  "/make-server-b90be4d1/appointments/book",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (!user || error) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { userId, slots } = await c.req.json();

      if (user.id !== userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const profile = await kv.get(`user:${userId}`);
      if (!profile) {
        return c.json({ error: "Profile not found" }, 404);
      }

      // Book appointments (can be 3 or 9 depending on package)
      const appointmentIds = [];

      for (const [rdvKey, slotId] of Object.entries(slots)) {
        // Skip null slots (optional appointments that weren't selected)
        if (!slotId) {
          console.log(
            `Skipping optional appointment: ${rdvKey}`,
          );
          continue;
        }

        const slot = await kv.get(`slot:${slotId}`);
        if (!slot) {
          return c.json(
            { error: `Slot ${slotId} not found` },
            404,
          );
        }

        // Check availability
        if (slot.spotsAvailable <= 0) {
          return c.json(
            { error: `Slot ${slotId} is full` },
            400,
          );
        }

        // Create appointment
        const appointmentId = `${userId}-${rdvKey}-${Date.now()}`;
        const appointment = {
          id: appointmentId,
          userId,
          userName: profile.name,
          userEmail: profile.email,
          slotId,
          slotDateTime: slot.dateTime,
          type: rdvKey, // e.g., 'rdv1', 'rdv1_1', 'rdv2_2', etc.
          status: "confirmed",
          createdAt: new Date().toISOString(),
        };

        await kv.set(
          `appointment:${appointmentId}`,
          appointment,
        );
        appointmentIds.push(appointmentId);

        // Update slot availability
        slot.spotsAvailable =
          (slot.spotsAvailable || slot.maxCapacity) - 1;
        await kv.set(`slot:${slotId}`, slot);
      }

      // Save appointment IDs to user
      await kv.set(
        `appointments:user:${userId}`,
        appointmentIds,
      );

      console.log(
        `Successfully booked ${appointmentIds.length} appointments for user ${userId}`,
      );
      return c.json({ success: true, appointmentIds });
    } catch (error) {
      console.log("Error booking appointments:", error);
      return c.json(
        { error: "Server error booking appointments" },
        500,
      );
    }
  },
);

// ===== ADMIN ROUTES =====

app.get("/make-server-b90be4d1/admin/slots", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];

    console.log("[Admin Slots GET] Request received, has token:", !!accessToken);

    if (!accessToken) {
      console.log("[Admin Slots GET] No access token provided");
      return c.json({ error: "Unauthorized - No access token" }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    
    if (error) {
      console.log("[Admin Slots GET] Auth error:", error.message);
      return c.json({ error: "Unauthorized - Invalid token: " + error.message }, 401);
    }
    
    if (!user) {
      console.log("[Admin Slots GET] No user found from token");
      return c.json({ error: "Unauthorized - User not found" }, 401);
    }

    console.log("[Admin Slots GET] User authenticated:", user.id);

    // Check if user is admin
    const profile = await kv.get(`user:${user.id}`);
    console.log("[Admin Slots GET] User profile:", { id: user.id, role: profile?.role });
    
    if (!profile || profile.role !== "admin") {
      console.log("[Admin Slots GET] User is not admin");
      return c.json(
        { error: "Unauthorized - Admin only (your role: " + (profile?.role || "none") + ")" },
        403,
      );
    }

    // Get all slots
    const slotsData = await kv.getByPrefix("slot:");
    const slots = slotsData
      .map((item: any) => item.value)
      .filter((slot: any) => slot && slot.id);

    console.log("[Admin Slots GET] Returning", slots.length, "slots");
    return c.json({ slots });
  } catch (error: any) {
    console.log("Error fetching admin slots:", error?.message || error);
    return c.json(
      { error: "Server error fetching slots: " + (error?.message || error), slots: [] },
      500,
    );
  }
});

app.get(
  "/make-server-b90be4d1/admin/appointments",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (!user || error) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Check if user is admin
      const profile = await kv.get(`user:${user.id}`);
      if (!profile || profile.role !== "admin") {
        return c.json(
          { error: "Unauthorized - Admin only" },
          403,
        );
      }

      // Get all appointments
      const appointmentsData =
        await kv.getByPrefix("appointment:");
      const appointments = appointmentsData
        .map((item: any) => item.value)
        .filter((apt: any) => apt && apt.id);

      return c.json({ appointments });
    } catch (error) {
      console.log("Error fetching admin appointments:", error);
      return c.json(
        {
          error: "Server error fetching appointments",
          appointments: [],
        },
        500,
      );
    }
  },
);

app.post("/make-server-b90be4d1/admin/slots", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];

    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const profile = await kv.get(`user:${user.id}`);
    if (!profile || profile.role !== "admin") {
      return c.json(
        { error: "Unauthorized - Admin only" },
        403,
      );
    }

    const { type, dateTime, maxCapacity, visioLink } = await c.req.json();

    console.log("[Admin] Creating slot with:", { type, dateTime, maxCapacity, visioLink });

    if (!type || !dateTime || !maxCapacity) {
      console.log("[Admin] Missing required fields:", { type, dateTime, maxCapacity });
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Create slot
    const slotId = `slot-${type}-${Date.now()}`;
    const slot = {
      id: slotId,
      type,
      dateTime,
      maxCapacity,
      spotsAvailable: maxCapacity,
      visioLink: visioLink || "",
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };

    console.log("[Admin] Saving slot:", slot);
    await kv.set(`slot:${slotId}`, slot);
    console.log("[Admin] Slot saved successfully");

    return c.json({ success: true, slot });
  } catch (error) {
    console.log("Error creating slot:", error);
    return c.json({ error: "Server error creating slot" }, 500);
  }
});

app.delete(
  "/make-server-b90be4d1/admin/slots/:slotId",
  async (c) => {
    try {
      const slotId = c.req.param("slotId");
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (!user || error) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Check if user is admin
      const profile = await kv.get(`user:${user.id}`);
      if (!profile || profile.role !== "admin") {
        return c.json(
          { error: "Unauthorized - Admin only" },
          403,
        );
      }

      // Delete slot
      await kv.del(`slot:${slotId}`);

      return c.json({ success: true });
    } catch (error) {
      console.log("Error deleting slot:", error);
      return c.json(
        { error: "Server error deleting slot" },
        500,
      );
    }
  },
);

// TEMPORARY ROUTE: Promote user to admin (REMOVE AFTER USE)
app.post(
  "/make-server-b90be4d1/admin/promote-user",
  async (c) => {
    try {
      const { userId, secretKey } = await c.req.json();

      // Simple security: require a secret key
      if (secretKey !== "opportunity-admin-2025") {
        return c.json({ error: "Invalid secret key" }, 403);
      }

      if (!userId) {
        return c.json({ error: "userId is required" }, 400);
      }

      // Get user profile
      const profile = await kv.get(`user:${userId}`);
      if (!profile) {
        return c.json({ error: "User not found" }, 404);
      }

      // Update user role to admin
      const updatedProfile = {
        ...profile,
        role: "admin",
      };

      await kv.set(`user:${userId}`, updatedProfile);

      return c.json({
        success: true,
        message: `User ${profile.name || userId} is now an admin`,
        profile: updatedProfile,
      });
    } catch (error) {
      console.log("Error promoting user to admin:", error);
      return c.json({ error: "Server error" }, 500);
    }
  },
);

// TEMPORARY ROUTE: Promote user to admin by email (REMOVE AFTER USE)
app.post(
  "/make-server-b90be4d1/admin/promote-by-email",
  async (c) => {
    try {
      const { email, secretKey } = await c.req.json();

      // Simple security: require a secret key
      if (secretKey !== "opportunity-admin-2025") {
        return c.json({ error: "Invalid secret key" }, 403);
      }

      if (!email) {
        return c.json({ error: "email is required" }, 400);
      }

      // Find user by email
      const allUsers = await kv.getByPrefix("user:");
      const userEntry = allUsers.find(
        (entry: any) =>
          entry.email?.toLowerCase() === email.toLowerCase(),
      );

      if (!userEntry) {
        return c.json(
          {
            error: `User with email ${email} not found. Please register first.`,
          },
          404,
        );
      }

      // Update user role to admin
      const updatedProfile = {
        ...userEntry,
        role: "admin",
      };

      await kv.set(`user:${userEntry.id}`, updatedProfile);

      return c.json({
        success: true,
        message: `User ${userEntry.name || email} is now an admin`,
        profile: updatedProfile,
      });
    } catch (error) {
      console.log(
        "Error promoting user to admin by email:",
        error,
      );
      return c.json({ error: "Server error" }, 500);
    }
  },
);

// Update slot visio link (admin only)
app.put(
  "/make-server-b90be4d1/admin/slots/:slotId/visio-link",
  async (c) => {
    try {
      const slotId = c.req.param("slotId");
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (!user || error) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Check if user is admin
      const profile = await kv.get(`user:${user.id}`);
      if (!profile || profile.role !== "admin") {
        return c.json(
          { error: "Unauthorized - Admin only" },
          403,
        );
      }

      const { visioLink } = await c.req.json();

      // Get and update slot
      const slot = await kv.get(`slot:${slotId}`);
      if (!slot) {
        return c.json({ error: "Slot not found" }, 404);
      }

      const updatedSlot = {
        ...slot,
        visioLink: visioLink || "",
        updatedAt: new Date().toISOString(),
      };

      await kv.set(`slot:${slotId}`, updatedSlot);

      return c.json({ success: true, slot: updatedSlot });
    } catch (error) {
      console.log("Error updating slot visio link:", error);
      return c.json(
        { error: "Server error updating slot" },
        500,
      );
    }
  },
);

// Send visio email (admin only)
app.post(
  "/make-server-b90be4d1/admin/send-visio-email",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (!user || error) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Check if user is admin
      const profile = await kv.get(`user:${user.id}`);
      if (!profile || profile.role !== "admin") {
        return c.json(
          { error: "Unauthorized - Admin only" },
          403,
        );
      }

      const {
        appointmentId,
        userEmail,
        userName,
        slotDateTime,
        visioLink,
        rdvType,
      } = await c.req.json();

      if (!appointmentId || !userEmail || !visioLink) {
        return c.json(
          { error: "Missing required fields" },
          400,
        );
      }

      // Format the date
      const rdvDate = new Date(slotDateTime);
      const formattedDate = rdvDate.toLocaleDateString(
        "fr-FR",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      );

      // Get RDV type label
      const getRdvTypeLabel = (type: string) => {
        if (type.startsWith("rdv1")) return "Visio Explicative";
        if (type.startsWith("rdv2")) return "Préparation";
        if (type.startsWith("rdv3")) return "Récap";
        return type;
      };

      const rdvLabel = getRdvTypeLabel(rdvType);

      // Log email send (in production, you would integrate with an email service like SendGrid, Resend, etc.)
      console.log(
        `[Email] Sending visio link to ${userName} (${userEmail})`,
      );
      console.log(`[Email] RDV Type: ${rdvLabel}`);
      console.log(`[Email] Date: ${formattedDate}`);
      console.log(`[Email] Visio Link: ${visioLink}`);

      // Store email log
      const emailLogId = `email-log-${Date.now()}`;
      await kv.set(`email:${emailLogId}`, {
        id: emailLogId,
        appointmentId,
        userEmail,
        userName,
        slotDateTime,
        visioLink,
        rdvType,
        rdvLabel,
        sentAt: new Date().toISOString(),
        sentBy: user.id,
        status: "sent",
      });

      // In production, you would integrate with an email service here:
      /*
    await sendEmail({
      to: userEmail,
      subject: `Lien de visioconférence - ${rdvLabel}`,
      html: `
        <h2>Bonjour ${userName},</h2>
        <p>Voici votre lien de visioconférence pour votre rendez-vous :</p>
        <p><strong>Type :</strong> ${rdvLabel}</p>
        <p><strong>Date :</strong> ${formattedDate}</p>
        <p><a href="${visioLink}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Rejoindre la visio</a></p>
        <p>À très bientôt sur Opportunity !</p>
      `,
    });
    */

      return c.json({
        success: true,
        message: `Email envoyé à ${userEmail}`,
        emailLogId,
      });
    } catch (error) {
      console.log("Error sending visio email:", error);
      return c.json(
        { error: "Server error sending email" },
        500,
      );
    }
  },
);

// Get all premium service purchases (admin only)
app.get(
  "/make-server-b90be4d1/admin/premium-purchases",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (!user || error) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Check if user is admin
      const profile = await kv.get(`user:${user.id}`);
      if (!profile || profile.role !== "admin") {
        return c.json(
          { error: "Unauthorized - Admin only" },
          403,
        );
      }

      // Get all premium service purchases
      const purchasesData = await kv.getByPrefix(
        "premium-purchase:",
      );
      const purchases = purchasesData
        .map((item: any) => item.value)
        .filter((purchase: any) => purchase && purchase.id)
        .sort((a: any, b: any) => {
          // Sort by date, most recent first
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        });

      return c.json({ purchases });
    } catch (error) {
      console.log("Error fetching premium purchases:", error);
      return c.json(
        {
          error: "Server error fetching purchases",
          purchases: [],
        },
        500,
      );
    }
  },
);

// Get all service bookings (admin only)
app.get("/make-server-b90be4d1/admin/orders", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];

    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const profile = await kv.get(`user:${user.id}`);
    if (!profile || profile.role !== "admin") {
      return c.json(
        { error: "Unauthorized - Admin only" },
        403,
      );
    }

    // Get all bookings
    const bookingsData = await kv.getByPrefix("booking:");
    const bookings = bookingsData
      .map((item: any) => item.value)
      .filter((booking: any) => booking && booking.id)
      .sort((a: any, b: any) => {
        // Sort by date, most recent first
        return (
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
        );
      });

    return c.json({ orders: bookings });
  } catch (error) {
    console.log("Error fetching orders:", error);
    return c.json(
      { error: "Server error fetching orders", orders: [] },
      500,
    );
  }
});

// Get all users (admin only)
app.get("/make-server-b90be4d1/admin/users", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];

    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const profile = await kv.get(`user:${user.id}`);
    if (!profile || profile.role !== "admin") {
      return c.json(
        { error: "Unauthorized - Admin only" },
        403,
      );
    }

    // Get all users
    const usersData = await kv.getByPrefix("user:");
    const users = usersData
      .map((item: any) => item.value)
      .filter((user: any) => user && user.id)
      .sort((a: any, b: any) => {
        // Sort by creation date, most recent first
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });

    return c.json({ users });
  } catch (error) {
    console.log("Error fetching users:", error);
    return c.json(
      { error: "Server error fetching users", users: [] },
      500,
    );
  }
});

// ===== STRIPE PAYMENT INTEGRATION =====

// Create Payment Intent
app.post(
  "/make-server-b90be4d1/stripe/create-payment-intent",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (!user || error) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { amount, description, metadata } =
        await c.req.json();

      if (!amount || amount <= 0) {
        return c.json({ error: "Invalid amount" }, 400);
      }

      const STRIPE_SECRET_KEY = Deno.env.get(
        "STRIPE_SECRET_KEY",
      );
      if (!STRIPE_SECRET_KEY) {
        console.error("STRIPE_SECRET_KEY not configured");
        return c.json(
          {
            error:
              "Payment system not configured. Please add STRIPE_SECRET_KEY.",
          },
          500,
        );
      }

      // Create Payment Intent with Stripe API
      const stripeResponse = await fetch(
        "https://api.stripe.com/v1/payment_intents",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            amount: Math.round(amount * 100).toString(), // Convert to cents
            currency: "eur",
            description: description || "Paiement Opportunity",
            "metadata[userId]": user.id,
            ...Object.entries(metadata || {}).reduce(
              (acc, [key, value]) => {
                acc[`metadata[${key}]`] = String(value);
                return acc;
              },
              {} as Record<string, string>,
            ),
          }),
        },
      );

      if (!stripeResponse.ok) {
        const error = await stripeResponse.json();
        console.error("Stripe API error:", error);
        return c.json(
          { error: "Failed to create payment intent" },
          500,
        );
      }

      const paymentIntent = await stripeResponse.json();

      return c.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      return c.json(
        { error: "Server error creating payment" },
        500,
      );
    }
  },
);

// Stripe Webhook (for payment confirmation)
app.post("/make-server-b90be4d1/stripe/webhook", async (c) => {
  try {
    const signature = c.req.header("stripe-signature");
    const STRIPE_WEBHOOK_SECRET = Deno.env.get(
      "STRIPE_WEBHOOK_SECRET",
    );

    if (!STRIPE_WEBHOOK_SECRET) {
      console.warn(
        "⚠️ STRIPE_WEBHOOK_SECRET not configured - webhook verification disabled (dev mode)",
      );
    }

    const body = await c.req.text();

    // Parse event
    const event = JSON.parse(body);

    console.log(
      "🔔 Received Stripe webhook event:",
      event.type,
    );

    // Handle different event types
    switch (event.type) {
      // ===== PAIEMENTS UNIQUES (Services Premium) =====
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata?.userId;
        const serviceType = paymentIntent.metadata?.serviceType;
        const bookingId = paymentIntent.metadata?.bookingId;
        const professionalId =
          paymentIntent.metadata?.professionalId;

        console.log("✅ Payment succeeded:", {
          userId,
          serviceType,
          bookingId,
          amount: paymentIntent.amount / 100,
        });

        // Store payment record
        await kv.set(`payment:${paymentIntent.id}`, {
          id: paymentIntent.id,
          userId,
          amount: paymentIntent.amount / 100,
          serviceType,
          bookingId,
          professionalId,
          status: "succeeded",
          createdAt: new Date().toISOString(),
        });

        // If it's a booking, update booking status
        if (bookingId) {
          const booking = await kv.get(`booking:${bookingId}`);
          if (booking) {
            await kv.set(`booking:${bookingId}`, {
              ...booking,
              paymentStatus: "paid",
              paymentIntentId: paymentIntent.id,
              paidAt: new Date().toISOString(),
            });
          }
        }

        // If it's a service purchase, mark as purchased
        if (serviceType && userId) {
          const userServices =
            (await kv.get(
              `user:${userId}:purchased_services`,
            )) || [];
          if (!userServices.includes(serviceType)) {
            userServices.push(serviceType);
            await kv.set(
              `user:${userId}:purchased_services`,
              userServices,
            );
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata?.userId;
        const bookingId = paymentIntent.metadata?.bookingId;

        console.error("❌ Payment failed:", {
          userId,
          bookingId,
          error: paymentIntent.last_payment_error?.message,
        });

        // Store failed payment
        await kv.set(`payment:${paymentIntent.id}`, {
          id: paymentIntent.id,
          userId,
          status: "failed",
          error: paymentIntent.last_payment_error?.message,
          createdAt: new Date().toISOString(),
        });

        // Update booking if exists
        if (bookingId) {
          const booking = await kv.get(`booking:${bookingId}`);
          if (booking) {
            await kv.set(`booking:${bookingId}`, {
              ...booking,
              paymentStatus: "failed",
            });
          }
        }
        break;
      }

      // ===== ABONNEMENTS (5,99€/an) =====
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription;

        console.log("✅ Checkout session completed:", {
          userId,
          subscriptionId,
        });

        if (userId && subscriptionId) {
          // Store subscription info
          await kv.set(`user:${userId}:subscription`, {
            subscriptionId,
            status: "active",
            startedAt: new Date().toISOString(),
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        console.log(
          `📝 Subscription ${event.type === "customer.subscription.created" ? "created" : "updated"}:`,
          {
            userId,
            status: subscription.status,
          },
        );

        if (userId) {
          await kv.set(`user:${userId}:subscription`, {
            subscriptionId: subscription.id,
            status: subscription.status,
            currentPeriodEnd: new Date(
              subscription.current_period_end * 1000,
            ).toISOString(),
            cancelAtPeriodEnd:
              subscription.cancel_at_period_end,
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        console.log("🗑️ Subscription deleted:", { userId });

        if (userId) {
          await kv.set(`user:${userId}:subscription`, {
            subscriptionId: subscription.id,
            status: "canceled",
            canceledAt: new Date().toISOString(),
          });
        }
        break;
      }

      // ===== STRIPE CONNECT (Paiements Professionnels) =====
      case "account.updated": {
        const account = event.data.object;
        console.log("🏦 Stripe Connect account updated:", {
          accountId: account.id,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
        });

        // Update professional's Stripe Connect status
        const professionals = await kv.getByPrefix("profile:");
        for (const prof of professionals) {
          if (prof.stripeAccountId === account.id) {
            await kv.set(`profile:${prof.id}`, {
              ...prof,
              stripeChargesEnabled: account.charges_enabled,
              stripePayoutsEnabled: account.payouts_enabled,
              stripeAccountUpdatedAt: new Date().toISOString(),
            });
          }
        }
        break;
      }

      // ===== TRANSFERTS (Commission 1,99€) =====
      case "transfer.created": {
        const transfer = event.data.object;
        console.log("💸 Transfer created:", {
          amount: transfer.amount / 100,
          destination: transfer.destination,
        });
        break;
      }

      case "transfer.paid": {
        const transfer = event.data.object;
        console.log("✅ Transfer paid:", {
          amount: transfer.amount / 100,
          destination: transfer.destination,
        });
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

// ===== INITIALIZATION: CREATE DEMO ACCOUNT =====
async function initializeDemoAccount() {
  try {
    const demoEmail = "demo@opportunity.com";
    const demoPassword = "demo123";

    // Check if demo account already exists
    const existingProfile = await kv.getByPrefix("user:");
    const demoExists = existingProfile.some(
      (item: any) => item.value?.email === demoEmail,
    );

    if (!demoExists) {
      console.log("Creating demo account...");

      // Create demo user
      const { data, error } =
        await supabase.auth.admin.createUser({
          email: demoEmail,
          password: demoPassword,
          user_metadata: {
            name: "Compte Démo",
            userType: "artist",
            pseudo: "DemoUser",
          },
          email_confirm: true,
        });

      if (error) {
        console.log(
          "Demo account already exists or error:",
          error.message,
        );
        return;
      }

      const userId = data.user.id;

      // Store demo profile with full setup
      await kv.set(`user:${userId}`, {
        id: userId,
        email: demoEmail,
        name: "Compte Démo",
        pseudo: "DemoUser",
        profileImageUrl: null,
        userType: "artist",
        subscriptionStatus: "active",
        subscriptionExpiry: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        premiumServices: [],
        classification: "emergent",
        city: "Paris",
        bio: "Compte de démonstration pour découvrir Opportunity",
        createdAt: new Date().toISOString(),
        hasPaidSubscription: true,
        hasCompletedQuestionnaire: true,
        hasSignedContract: true,
        hasBookedAppointments: true,
      });

      console.log(
        "✅ Demo account created successfully:",
        demoEmail,
        "/",
        demoPassword,
      );
    } else {
      console.log("Demo account already exists");
    }
  } catch (error) {
    console.error("Error initializing demo account:", error);
  }
}

// Initialize demo account on server start
initializeDemoAccount();

// ===== BOOKINGS (Pro Services) =====

// Create a booking for a pro service
app.post("/make-server-b90be4d1/bookings", async (c) => {
  try {
    const {
      proUserId,
      artistUserId,
      date,
      duration,
      totalPrice,
      serviceName,
      notes,
    } = await c.req.json();

    // Validation
    if (!proUserId || !artistUserId || !date || !totalPrice) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];

    // Verify authentication
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);
    if (!user || authError || user.id !== artistUserId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Create booking with pending_validation status
    const bookingId = crypto.randomUUID();
    const booking = {
      id: bookingId,
      proId: proUserId,
      artistId: artistUserId,
      scheduledDate: date,
      duration: duration || 1,
      price: totalPrice,
      serviceName: serviceName || "Service professionnel",
      description: notes || "",
      status: "pending_validation", // Paiement en escrow jusqu'à validation
      createdAt: new Date().toISOString(),
      validatedAt: null,
      rating: null,
      comment: null,
    };

    await kv.set(`booking:${bookingId}`, booking);

    console.log(
      `Booking created - ID ${bookingId} - Artist ${artistUserId} - Pro ${proUserId} - Amount ${totalPrice}€`,
    );

    return c.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return c.json(
      { error: "Server error creating booking" },
      500,
    );
  }
});

// ===== SERVICE VALIDATION & RATING =====

// Get bookings pending validation for an artist
app.get(
  "/make-server-b90be4d1/bookings/to-validate/:artistId",
  async (c) => {
    try {
      const artistId = c.req.param("artistId");
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      // Verify authentication
      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (!user || error || user.id !== artistId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Get all bookings for this artist
      const bookingsData = await kv.getByPrefix(`booking:`);
      const allBookings = bookingsData
        .map((item: any) => item.value)
        .filter((b: any) => b && b.id);

      // Filter bookings pending validation
      const pendingBookings = allBookings.filter(
        (booking: any) =>
          booking.artistId === artistId &&
          booking.status === "pending_validation",
      );

      // Enrich with pro and service info
      const enrichedBookings = await Promise.all(
        pendingBookings.map(async (booking: any) => {
          // Get pro profile
          const proProfile = await kv.get(
            `user:${booking.proId}`,
          );

          // Get service details
          const proServices = await kv.get(
            `services:${booking.proId}`,
          );
          const service = proServices?.find(
            (s: any) => s.id === booking.serviceId,
          );

          return {
            ...booking,
            proName:
              proProfile?.name ||
              proProfile?.pseudo ||
              "Professionnel",
            serviceName:
              service?.name || booking.serviceName || "Service",
          };
        }),
      );

      return c.json(enrichedBookings);
    } catch (error) {
      console.error(
        "Error fetching bookings to validate:",
        error,
      );
      return c.json(
        { error: "Server error fetching bookings" },
        500,
      );
    }
  },
);

// Validate a service booking and rate the pro
app.post(
  "/make-server-b90be4d1/bookings/validate",
  async (c) => {
    try {
      const { bookingId, rating, comment, artistId } =
        await c.req.json();

      // Validation
      if (!bookingId || !rating || !artistId) {
        return c.json(
          { error: "Missing required fields" },
          400,
        );
      }

      if (rating < 1 || rating > 5) {
        return c.json(
          { error: "Rating must be between 1 and 5" },
          400,
        );
      }

      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      // Verify authentication
      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (!user || authError || user.id !== artistId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Get booking
      const booking = await kv.get(`booking:${bookingId}`);
      if (!booking) {
        return c.json({ error: "Booking not found" }, 404);
      }

      // Verify booking belongs to artist and is pending validation
      if (booking.artistId !== artistId) {
        return c.json(
          { error: "Unauthorized - Not your booking" },
          403,
        );
      }

      if (booking.status !== "pending_validation") {
        return c.json(
          { error: "Booking is not pending validation" },
          400,
        );
      }

      // Update booking status to completed
      const updatedBooking = {
        ...booking,
        status: "completed",
        validatedAt: new Date().toISOString(),
        rating,
        comment: comment || null,
      };

      await kv.set(`booking:${bookingId}`, updatedBooking);

      // Update pro's ratings
      const proId = booking.proId;
      const proProfile = await kv.get(`user:${proId}`);

      if (proProfile) {
        const currentRatings = proProfile.ratings || [];
        const newRating = {
          id: crypto.randomUUID(),
          bookingId,
          artistId,
          rating,
          comment: comment || null,
          createdAt: new Date().toISOString(),
          serviceName: booking.serviceName,
        };

        currentRatings.push(newRating);

        // Calculate new average rating
        const totalRatings = currentRatings.length;
        const sumRatings = currentRatings.reduce(
          (sum: number, r: any) => sum + r.rating,
          0,
        );
        const averageRating = sumRatings / totalRatings;

        const updatedProProfile = {
          ...proProfile,
          ratings: currentRatings,
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          totalRatings,
        };

        await kv.set(`user:${proId}`, updatedProProfile);
      }

      // 🚀 Stripe Connect: Release payment to pro after validation
      const STRIPE_SECRET_KEY = Deno.env.get(
        "STRIPE_SECRET_KEY",
      );
      if (
        STRIPE_SECRET_KEY &&
        booking.paymentIntentId &&
        proProfile.stripeAccountId
      ) {
        try {
          // Transfer funds to pro's Stripe Connect account
          const transferAmount = Math.round(
            (booking.totalPrice - 1.99) * 100,
          ); // Amount in cents, minus 1,99€ commission

          const transferResponse = await fetch(
            "https://api.stripe.com/v1/transfers",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
                "Content-Type":
                  "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                amount: transferAmount.toString(),
                currency: "eur",
                destination: proProfile.stripeAccountId,
                description: `Paiement pour ${booking.serviceName || "service"} - Booking ${bookingId}`,
                metadata: JSON.stringify({
                  bookingId,
                  proId,
                  artistId,
                }),
              }),
            },
          );

          const transferData = await transferResponse.json();

          if (transferResponse.ok) {
            updatedBooking.transferId = transferData.id;
            console.log(
              `✅ Stripe Transfer successful: ${transferData.id} - ${transferAmount / 100}€ sent to pro ${proId}`,
            );
          } else {
            console.error(
              `❌ Stripe Transfer failed:`,
              transferData,
            );
          }
        } catch (stripeError) {
          console.error(
            "Error releasing payment via Stripe Connect:",
            stripeError,
          );
          // Continue even if transfer fails - admin can handle manually
        }
      } else {
        console.log(
          `⚠️ Stripe not configured - Booking ${bookingId} validated but payment not released automatically`,
        );
      }

      return c.json({
        success: true,
        booking: updatedBooking,
        message: "Service validated successfully",
      });
    } catch (error) {
      console.error("Error validating booking:", error);
      return c.json(
        { error: "Server error validating booking" },
        500,
      );
    }
  },
);

// ===== STRIPE CONNECT =====
// Routes pour gérer l'onboarding et les paiements des professionnels

// Create Stripe Connect onboarding link
app.post("/make-server-b90be4d1/connect/onboard", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];

    if (!accessToken) {
      return c.json(
        { error: "Unauthorized - Missing access token" },
        401,
      );
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      console.error(
        "Stripe Connect onboard auth error:",
        error,
      );
      return c.json(
        { error: "Unauthorized - Invalid token" },
        401,
      );
    }

    const userId = user.id;
    const profile = await kv.get(`user:${userId}`);

    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    if (profile.userType !== "pro") {
      return c.json(
        {
          error:
            "Only professionals can create Stripe Connect accounts",
        },
        403,
      );
    }

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      return c.json(
        {
          error:
            "Stripe not configured. Please add STRIPE_SECRET_KEY to environment variables.",
        },
        500,
      );
    }

    let accountId = profile.stripeAccountId;

    // Create Stripe Connect account if doesn't exist
    if (!accountId) {
      const createAccountResponse = await fetch(
        "https://api.stripe.com/v1/accounts",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            type: "express", // Express accounts support both Individual and Company
            country: "FR",
            email: profile.email,
            capabilities: JSON.stringify({
              transfers: { requested: true },
            }),
            business_type: "individual", // Default to individual, user can change during onboarding
            metadata: JSON.stringify({
              userId,
              userType: "pro",
              name: profile.name,
            }),
          }),
        },
      );

      const accountData = await createAccountResponse.json();

      if (!createAccountResponse.ok) {
        console.error(
          "Stripe account creation error:",
          accountData,
        );
        return c.json(
          {
            error: `Stripe account creation failed: ${accountData.error?.message || "Unknown error"}`,
          },
          500,
        );
      }

      accountId = accountData.id;

      // Save account ID to profile
      profile.stripeAccountId = accountId;
      profile.stripeAccountStatus = "pending";
      await kv.set(`user:${userId}`, profile);
    }

    // Create account link for onboarding
    const accountLinkResponse = await fetch(
      "https://api.stripe.com/v1/account_links",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          account: accountId,
          refresh_url: `${c.req.header("origin") || "https://localhost"}/profile?stripe_onboarding=refresh`,
          return_url: `${c.req.header("origin") || "https://localhost"}/profile?stripe_onboarding=success`,
          type: "account_onboarding",
        }),
      },
    );

    const linkData = await accountLinkResponse.json();

    if (!accountLinkResponse.ok) {
      console.error("Stripe account link error:", linkData);
      return c.json(
        {
          error: `Stripe onboarding link failed: ${linkData.error?.message || "Unknown error"}`,
        },
        500,
      );
    }

    return c.json({
      success: true,
      url: linkData.url,
      accountId,
    });
  } catch (error) {
    console.error("Stripe Connect onboard error:", error);
    return c.json(
      { error: "Server error creating onboarding link" },
      500,
    );
  }
});

// Get Stripe Connect account status
app.get(
  "/make-server-b90be4d1/connect/account-status/:userId",
  async (c) => {
    try {
      const userId = c.req.param("userId");
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (!user || error || user.id !== userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const profile = await kv.get(`user:${userId}`);
      if (!profile) {
        return c.json({ error: "Profile not found" }, 404);
      }

      if (!profile.stripeAccountId) {
        return c.json({ status: "none", accountId: null });
      }

      const STRIPE_SECRET_KEY = Deno.env.get(
        "STRIPE_SECRET_KEY",
      );
      if (!STRIPE_SECRET_KEY) {
        return c.json({ error: "Stripe not configured" }, 500);
      }

      // Fetch account details from Stripe
      const accountResponse = await fetch(
        `https://api.stripe.com/v1/accounts/${profile.stripeAccountId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          },
        },
      );

      const accountData = await accountResponse.json();

      if (!accountResponse.ok) {
        console.error(
          "Stripe account fetch error:",
          accountData,
        );
        return c.json(
          { error: "Failed to fetch Stripe account status" },
          500,
        );
      }

      // Determine status
      let status = "pending";
      if (
        accountData.charges_enabled &&
        accountData.payouts_enabled
      ) {
        status = "active";
      } else if (accountData.requirements?.disabled_reason) {
        status = "restricted";
      }

      // Update profile if status changed
      if (profile.stripeAccountStatus !== status) {
        profile.stripeAccountStatus = status;
        await kv.set(`user:${userId}`, profile);
      }

      return c.json({
        status,
        accountId: profile.stripeAccountId,
        chargesEnabled: accountData.charges_enabled,
        payoutsEnabled: accountData.payouts_enabled,
        detailsSubmitted: accountData.details_submitted,
      });
    } catch (error) {
      console.error(
        "Error fetching Stripe account status:",
        error,
      );
      return c.json(
        { error: "Server error fetching account status" },
        500,
      );
    }
  },
);

// Create Stripe Connect dashboard link
app.post(
  "/make-server-b90be4d1/connect/dashboard",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];

      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      if (!user || error) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const profile = await kv.get(`user:${user.id}`);
      if (!profile || !profile.stripeAccountId) {
        return c.json(
          { error: "No Stripe Connect account found" },
          404,
        );
      }

      const STRIPE_SECRET_KEY = Deno.env.get(
        "STRIPE_SECRET_KEY",
      );
      if (!STRIPE_SECRET_KEY) {
        return c.json({ error: "Stripe not configured" }, 500);
      }

      // Create login link for Stripe Express dashboard
      const loginLinkResponse = await fetch(
        `https://api.stripe.com/v1/accounts/${profile.stripeAccountId}/login_links`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          },
        },
      );

      const linkData = await loginLinkResponse.json();

      if (!loginLinkResponse.ok) {
        console.error("Stripe dashboard link error:", linkData);
        return c.json(
          { error: "Failed to create dashboard link" },
          500,
        );
      }

      return c.json({
        success: true,
        url: linkData.url,
      });
    } catch (error) {
      console.error("Error creating dashboard link:", error);
      return c.json(
        { error: "Server error creating dashboard link" },
        500,
      );
    }
  },
);

// Webhook for Stripe Connect account updates
app.post("/make-server-b90be4d1/connect/webhook", async (c) => {
  try {
    const event = await c.req.json();

    // In production, verify webhook signature here
    console.log("Stripe Connect webhook received:", event.type);

    if (event.type === "account.updated") {
      const account = event.data.object;
      const userId = account.metadata?.userId;

      if (userId) {
        const profile = await kv.get(`user:${userId}`);
        if (profile) {
          let status = "pending";
          if (
            account.charges_enabled &&
            account.payouts_enabled
          ) {
            status = "active";
          } else if (account.requirements?.disabled_reason) {
            status = "restricted";
          }

          profile.stripeAccountStatus = status;
          await kv.set(`user:${userId}`, profile);

          console.log(
            `✅ Updated Stripe account status for user ${userId}: ${status}`,
          );
        }
      }
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return c.json({ error: "Webhook processing error" }, 500);
  }
});

// ===== ADMIN ROUTES =====

// Get all users (for debugging/admin panel)
app.get("/make-server-b90be4d1/admin/users", async (c) => {
  try {
    console.log("[Admin] Fetching all users for debug panel");

    // Get all users from KV store
    const allUsersData = await kv.getByPrefix("user:");

    if (!allUsersData || !Array.isArray(allUsersData)) {
      console.log(
        "[Admin] No users found or invalid data format",
      );
      return c.json({ users: [] });
    }

    // Extract user values and filter out any invalid entries
    const users = allUsersData
      .map((item: any) => item.value)
      .filter((u: any) => u && u.id);

    console.log(
      `[Admin] Found ${users.length} users in database`,
    );

    return c.json({
      users,
      count: users.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Admin] Error fetching all users:", error);
    return c.json(
      { error: "Server error fetching users", users: [] },
      500,
    );
  }
});

Deno.serve(app.fetch);