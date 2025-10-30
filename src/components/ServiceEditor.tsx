import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface Service {
  name: string;
  description: string;
  price: number;
  hourlyRate?: number;
  features: string[];
  category?: string;
  availability?: string;
}

interface ServiceEditorProps {
  services: Service[];
  onSave: (services: Service[]) => void;
  onClose: () => void;
}

export function ServiceEditor({ services, onSave, onClose }: ServiceEditorProps) {
  const professionalCategories = [
    { value: 'production', label: 'Production' },
    { value: 'studio', label: 'Studio' },
    { value: 'management', label: 'Management' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'evenementiel', label: 'Événementiel' },
    { value: 'media', label: 'Média' },
    { value: 'design', label: 'Design' },
    { value: 'video', label: 'Vidéo' },
    { value: 'autre', label: 'Autre' },
  ];
  
  const [editedServices, setEditedServices] = useState<Service[]>(services.length > 0 ? services : [
    { name: '', description: '', price: 0, features: [''], category: '', availability: '' }
  ]);

  const addService = () => {
    setEditedServices([...editedServices, { 
      name: '', 
      description: '', 
      price: 0, 
      hourlyRate: 0,
      features: [''], 
      category: '', 
      availability: '' 
    }]);
  };

  const removeService = (index: number) => {
    setEditedServices(editedServices.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof Service, value: any) => {
    const updated = [...editedServices];
    updated[index] = { ...updated[index], [field]: value };
    setEditedServices(updated);
  };

  const addFeature = (serviceIndex: number) => {
    const updated = [...editedServices];
    updated[serviceIndex].features.push('');
    setEditedServices(updated);
  };

  const updateFeature = (serviceIndex: number, featureIndex: number, value: string) => {
    const updated = [...editedServices];
    updated[serviceIndex].features[featureIndex] = value;
    setEditedServices(updated);
  };

  const removeFeature = (serviceIndex: number, featureIndex: number) => {
    const updated = [...editedServices];
    updated[serviceIndex].features = updated[serviceIndex].features.filter((_, i) => i !== featureIndex);
    setEditedServices(updated);
  };

  const handleSave = () => {
    // Filter out empty services
    // For application categories (evenementiel, media), price is not required
    const validServices = editedServices.filter(s => {
      if (!s.name.trim()) return false;
      const isApplicationCategory = s.category === 'evenementiel' || s.category === 'media';
      if (isApplicationCategory) {
        // For application services, availability is required
        return s.availability && s.availability.trim().length > 0;
      }
      // For regular services, at least one pricing method is required
      return (s.price && s.price > 0) || (s.hourlyRate && s.hourlyRate > 0);
    });
    onSave(validServices);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl">Gérer mes services</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {editedServices.map((service, serviceIdx) => (
              <div key={serviceIdx} className="border border-gray-200 rounded-xl p-6 relative">
                {/* Remove Service Button */}
                {editedServices.length > 1 && (
                  <button
                    onClick={() => removeService(serviceIdx)}
                    className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

                <div className="space-y-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm mb-2">Catégorie de service *</label>
                    <select
                      value={service.category || ''}
                      onChange={(e) => updateService(serviceIdx, 'category', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {professionalCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Service Name */}
                  <div>
                    <label className="block text-sm mb-2">Nom du service *</label>
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => updateService(serviceIdx, 'name', e.target.value)}
                      placeholder="Ex: Mixage professionnel"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Service Description */}
                  <div>
                    <label className="block text-sm mb-2">Description</label>
                    <textarea
                      value={service.description}
                      onChange={(e) => updateService(serviceIdx, 'description', e.target.value)}
                      rows={3}
                      placeholder="Décrivez votre service..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Price and Hourly Rate - Only for non-application categories */}
                  {service.category !== 'evenementiel' && service.category !== 'media' && (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-2">Prix forfaitaire (€)</label>
                          <input
                            type="number"
                            value={service.price}
                            onChange={(e) => updateService(serviceIdx, 'price', Number(e.target.value))}
                            placeholder="0"
                            min="0"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">Laissez à 0 si vous préférez un tarif horaire</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm mb-2">Tarif horaire (€/h)</label>
                          <input
                            type="number"
                            value={service.hourlyRate || ''}
                            onChange={(e) => updateService(serviceIdx, 'hourlyRate', Number(e.target.value))}
                            placeholder="50"
                            min="0"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">Pour les réservations à l'heure</p>
                        </div>
                      </div>
                      
                      {!service.price && !service.hourlyRate && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <p className="text-sm text-orange-800">
                            ⚠️ Veuillez définir soit un prix forfaitaire, soit un tarif horaire (ou les deux).
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Availability - For event and media categories */}
                  {(service.category === 'evenementiel' || service.category === 'media') && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          💡 Pour votre catégorie (<strong>{service.category === 'evenementiel' ? 'Événementiel' : 'Média'}</strong>), les artistes pourront <strong>postuler</strong> directement à vos annonces.
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-2">Disponibilité *</label>
                        <textarea
                          value={service.availability || ''}
                          onChange={(e) => updateService(serviceIdx, 'availability', e.target.value)}
                          rows={2}
                          placeholder="Ex: Disponible tous les week-ends, ou du 15 mars au 30 avril..."
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}

                  {/* Features */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm">Fonctionnalités incluses</label>
                      <button
                        onClick={() => addFeature(serviceIdx)}
                        className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter
                      </button>
                    </div>
                    <div className="space-y-2">
                      {service.features.map((feature, featureIdx) => (
                        <div key={featureIdx} className="flex gap-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(serviceIdx, featureIdx, e.target.value)}
                            placeholder="Ex: Mix audio professionnel"
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          {service.features.length > 1 && (
                            <button
                              onClick={() => removeFeature(serviceIdx, featureIdx)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addService}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-500 hover:text-purple-600 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Ajouter un service
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
