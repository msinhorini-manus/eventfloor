import { X, Bookmark, Share2, MapPin, Globe, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface ExhibitorDrawerProps {
  exhibitor: {
    id: number;
    name: string;
    logoUrl?: string | null;
    category?: string | null;
    boothNumber?: string | null;
    description?: string | null;
    website?: string | null;
  };
  onClose: () => void;
}

export default function ExhibitorDrawer({ exhibitor, onClose }: ExhibitorDrawerProps) {
  const { t } = useTranslation();
  const [visited, setVisited] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: exhibitor.name,
          text: exhibitor.description || '',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  // Parse categories from category string (comma-separated)
  const categories = exhibitor.category?.split(',').map(c => c.trim()).filter(Boolean) || [];

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="p-4 flex items-start gap-3">
            {/* Logo */}
            {exhibitor.logoUrl ? (
              <img 
                src={exhibitor.logoUrl} 
                alt={exhibitor.name}
                className="w-14 h-14 object-contain rounded-full bg-blue-50 p-2"
              />
            ) : (
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-gray-900 text-xl font-bold">
                {exhibitor.name.substring(0, 1).toUpperCase()}
              </div>
            )}

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {exhibitor.name}
              </h2>
              {exhibitor.boothNumber && (
                <p className="text-sm text-gray-600">
                  {t('event.booth')}: {exhibitor.boothNumber}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Actions Row */}
          <div className="px-4 pb-4 flex items-center gap-3">
            {/* Visited Button */}
            <button
              onClick={() => setVisited(!visited)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all ${
                visited 
                  ? 'bg-green-50 border-green-500 text-green-700' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${visited ? 'fill-current' : ''}`} />
              <span className="font-medium text-sm">
                {visited ? 'Visitado' : 'Marcar Visitado'}
              </span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`p-2.5 rounded-full border-2 transition-all ${
                bookmarked 
                  ? 'bg-blue-50 border-blue-500 text-blue-600' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full border-2 border-gray-300 text-gray-600 hover:border-gray-400 transition-all"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary"
                  className="px-3 py-1 text-sm bg-orange-100 text-orange-800 hover:bg-orange-200"
                >
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          {/* Description */}
          {exhibitor.description && (
            <div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {exhibitor.description}
              </p>
            </div>
          )}

          {/* Website */}
          {exhibitor.website && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Globe className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <a
                  href={exhibitor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium break-all"
                >
                  {exhibitor.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </div>
          )}

          {/* Placeholder for Address (if needed in future) */}
          {/* <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">Address line 1</p>
              <p className="text-sm text-gray-700">Address line 2</p>
              <p className="text-sm text-gray-700">City, State ZIP</p>
              <p className="text-sm text-gray-700">Country</p>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
}
