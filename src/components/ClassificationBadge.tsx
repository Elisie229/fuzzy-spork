import { Award } from 'lucide-react';

interface ClassificationBadgeProps {
  classification: string;
  userType: 'artist' | 'pro';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function ClassificationBadge({
  classification,
  userType,
  size = 'md',
  showIcon = false,
}: ClassificationBadgeProps) {
  const getClassificationConfig = () => {
    if (userType === 'artist') {
      switch (classification) {
        case 'emergent':
          return {
            label: 'Émergent',
            gradient: 'from-green-400 via-green-500 to-emerald-600',
            textColor: 'text-white',
            shadow: 'shadow-green-500/50',
          };
        case 'developpement':
          return {
            label: 'Développement',
            gradient: 'from-orange-400 via-orange-500 to-orange-600',
            textColor: 'text-white',
            shadow: 'shadow-orange-500/50',
          };
        case 'confirme':
          return {
            label: 'Confirmé',
            gradient: 'from-purple-500 via-purple-600 to-violet-700',
            textColor: 'text-white',
            shadow: 'shadow-purple-500/50',
          };
        default:
          return {
            label: classification,
            gradient: 'from-gray-400 to-gray-600',
            textColor: 'text-white',
            shadow: 'shadow-gray-500/50',
          };
      }
    } else {
      // Pour les professionnels
      switch (classification) {
        case 'debutant':
          return {
            label: 'Débutant',
            gradient: 'from-yellow-400 via-yellow-500 to-amber-600',
            textColor: 'text-white',
            shadow: 'shadow-yellow-500/50',
          };
        case 'intermediaire':
          return {
            label: 'Intermédiaire',
            gradient: 'from-blue-400 via-blue-500 to-blue-600',
            textColor: 'text-white',
            shadow: 'shadow-blue-500/50',
          };
        case 'expert':
          return {
            label: 'Expert',
            gradient: 'from-red-500 via-red-600 to-rose-700',
            textColor: 'text-white',
            shadow: 'shadow-red-500/50',
          };
        default:
          return {
            label: classification,
            gradient: 'from-gray-400 to-gray-600',
            textColor: 'text-white',
            shadow: 'shadow-gray-500/50',
          };
      }
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          padding: 'px-3 py-1',
          icon: 'w-3 h-3',
          gap: 'space-x-1',
        };
      case 'lg':
        return {
          padding: 'px-6 py-3',
          icon: 'w-5 h-5',
          gap: 'space-x-2',
        };
      case 'md':
      default:
        return {
          padding: 'px-4 py-2',
          icon: 'w-4 h-4',
          gap: 'space-x-1.5',
        };
    }
  };

  const config = getClassificationConfig();
  const sizeClasses = getSizeClasses();

  return (
    <div
      className={`
        inline-flex items-center ${sizeClasses.gap} ${sizeClasses.padding}
        bg-gradient-to-r ${config.gradient}
        ${config.textColor}
        rounded-full shadow-lg ${config.shadow}
        backdrop-blur-sm
        transition-all duration-300 hover:scale-105
      `}
    >
      {showIcon && <Award className={sizeClasses.icon} />}
      <span className="tracking-wide">{config.label}</span>
    </div>
  );
}