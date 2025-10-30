import { useState } from 'react';
import { X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { Calendar } from './ui/calendar';

interface AvailabilityEditorProps {
  availability: string[];
  onSave: (availability: string[]) => void;
  onClose: () => void;
}

export function AvailabilityEditor({ availability, onSave, onClose }: AvailabilityEditorProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>(
    availability.map(d => new Date(d))
  );
  const [bulkMode, setBulkMode] = useState<'day' | 'week' | 'month' | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Fonction pour ajouter toutes les dates d'un mois
  const addFullMonth = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const newDates: Date[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // Ne pas ajouter si déjà présent
      if (!selectedDates.some(d => 
        d.getDate() === date.getDate() && 
        d.getMonth() === date.getMonth() && 
        d.getFullYear() === date.getFullYear()
      )) {
        newDates.push(date);
      }
    }
    
    setSelectedDates([...selectedDates, ...newDates]);
  };

  // Fonction pour ajouter toutes les dates d'une semaine à partir d'une date
  const addFullWeek = (startDate: Date) => {
    const newDates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      if (!selectedDates.some(d => 
        d.getDate() === date.getDate() && 
        d.getMonth() === date.getMonth() && 
        d.getFullYear() === date.getFullYear()
      )) {
        newDates.push(date);
      }
    }
    
    setSelectedDates([...selectedDates, ...newDates]);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // Si mode semaine, ajouter toute la semaine
    if (bulkMode === 'week') {
      addFullWeek(date);
      return;
    }

    const exists = selectedDates.some(d => 
      d.getDate() === date.getDate() && 
      d.getMonth() === date.getMonth() && 
      d.getFullYear() === date.getFullYear()
    );

    if (exists) {
      // Retirer la date
      setSelectedDates(selectedDates.filter(d => 
        !(d.getDate() === date.getDate() && 
          d.getMonth() === date.getMonth() && 
          d.getFullYear() === date.getFullYear())
      ));
    } else {
      // Ajouter la date
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleSave = () => {
    const dateStrings = selectedDates
      .sort((a, b) => a.getTime() - b.getTime())
      .map(d => d.toISOString());
    onSave(dateStrings);
  };

  const clearAllDates = () => {
    setSelectedDates([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl mb-1">Gérer mes disponibilités</h2>
            <p className="text-sm text-gray-600">
              Sélectionnez les jours où vous êtes disponible pour des collaborations
            </p>
          </div>
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
            {/* Mode de sélection rapide */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
              <h3 className="mb-3 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-purple-600" />
                Sélection rapide
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setBulkMode(bulkMode === 'day' ? null : 'day')}
                  className={`px-4 py-2 rounded-lg transition ${
                    bulkMode === 'day'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  Jour par jour
                </button>
                <button
                  onClick={() => setBulkMode(bulkMode === 'week' ? null : 'week')}
                  className={`px-4 py-2 rounded-lg transition ${
                    bulkMode === 'week'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  Semaine entière
                </button>
                <button
                  onClick={() => {
                    setBulkMode('month');
                    addFullMonth();
                  }}
                  className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-purple-100 transition"
                >
                  Mois entier
                </button>
                <button
                  onClick={clearAllDates}
                  className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                >
                  Tout effacer
                </button>
              </div>
              {bulkMode === 'week' && (
                <p className="text-sm text-purple-700 mt-2">
                  📅 Mode semaine activé : cliquez sur un jour pour sélectionner toute la semaine
                </p>
              )}
            </div>

            {/* Calendrier */}
            <div className="flex justify-center">
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                <Calendar
                  mode="single"
                  selected={selectedDates[0]}
                  onSelect={handleDateSelect}
                  month={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  className="rounded-md"
                  modifiers={{
                    selected: selectedDates
                  }}
                  modifiersStyles={{
                    selected: {
                      backgroundColor: 'rgb(147, 51, 234)',
                      color: 'white',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </div>
            </div>

            {/* Résumé des dates sélectionnées */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="mb-2 flex items-center">
                <Check className="w-5 h-5 mr-2 text-green-600" />
                Dates sélectionnées : {selectedDates.length}
              </h3>
              {selectedDates.length > 0 ? (
                <div className="max-h-32 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {selectedDates
                      .sort((a, b) => a.getTime() - b.getTime())
                      .slice(0, 20)
                      .map((date, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                        >
                          {date.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      ))}
                    {selectedDates.length > 20 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        ... et {selectedDates.length - 20} autres dates
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Aucune date sélectionnée. Cliquez sur le calendrier pour ajouter vos disponibilités.
                </p>
              )}
            </div>
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
            Enregistrer ({selectedDates.length} dates)
          </button>
        </div>
      </div>
    </div>
  );
}