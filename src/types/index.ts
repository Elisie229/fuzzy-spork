export type UserType = 'artist' | 'pro';

export type Classification = 'emergent' | 'developpement' | 'confirme' | 'debutant' | 'intermediaire' | 'expert';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  subscriptionStatus: 'none' | 'active';
  subscriptionExpiry: string | null;
  premiumServices: string[];
  classification: Classification | null;
  bio?: string;
  city?: string;
  pricePerHour?: number;
  avatar?: string;
  portfolio?: string[];
  socialLinks?: {
    youtube?: string;
    soundcloud?: string;
    spotify?: string;
    instagram?: string;
  };
  services?: string[]; // For pros: list of services they offer
  stripeAccountId?: string; // Stripe Connect account ID for pros
  stripeAccountStatus?: 'pending' | 'active' | 'restricted' | 'none'; // Stripe Connect onboarding status
  createdAt: string;
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Booking {
  id: string;
  proUserId: string;
  artistUserId: string;
  serviceName?: string;
  date: string;
  duration: number;
  totalPrice: number;
  platformFee: number; // 1,99€ commission Opportunity
  proAmount: number; // Amount transferred to pro after validation
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'validated';
  paymentIntentId?: string; // Stripe Payment Intent ID
  transferId?: string; // Stripe Transfer ID (after validation)
  validatedAt?: string; // Date when artist validated the service
  rating?: number; // Artist rating (1-5)
  review?: string; // Artist review
  createdAt: string;
}

export interface Questionnaire {
  // Collaboration questionnaire
  ambitions?: string;
  personality?: string;
  artisticUniverse?: string;
  productivity?: string;
  collaborationStyle?: string[];
  musicalTastes?: string;
  designStyles?: string;
  
  // Classification questionnaire
  experience?: string;
  platformPresence?: boolean;
  fanbaseSize?: string;
  projectsCompleted?: string;
  clientsReferences?: string;
  classification?: Classification;
  
  submittedAt: string;
}

export interface PremiumService {
  id: string;
  title: string;
  description: string;
  price: number;
  targetAudience: string;
}
