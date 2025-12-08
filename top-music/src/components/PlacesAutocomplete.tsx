
import React from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { MapPin, Flag } from 'lucide-react';

interface PlacesAutocompleteProps {
  label: string;
  placeholder?: string;
  icon: 'map-pin' | 'flag';
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  defaultValue?: string;
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  label,
  placeholder,
  icon,
  onLocationSelect,
  defaultValue = '',
}) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here if needed */
    },
    debounce: 300,
    defaultValue,
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSelect =
    ({ description }: { description: string }) =>
    async () => {
      // When user selects a place, we can replace the keyword without request data from API
      // by setting the second parameter to "false"
      setValue(description, false);
      clearSuggestions();

      // Get latitude and longitude via utility functions
      try {
        const results = await getGeocode({ address: description });
        const { lat, lng } = await getLatLng(results[0]);
        console.log('📍 Coordinates: ', { lat, lng });
        
        onLocationSelect({ address: description, lat, lng });
      } catch (error) {
        console.error('😱 Error: ', error);
      }
    };

  const Icon = icon === 'map-pin' ? MapPin : Flag;

  return (
    <div className="space-y-2 select-none">
      <label className="text-sm font-medium text-white/60 ml-1 select-none">
        {label}
      </label>
      <div className="relative group select-none">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors w-5 h-5 pointer-events-none" />
        <input
          value={value}
          onChange={handleInput}
          disabled={!ready}
          placeholder={placeholder || "Search location..."}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium disabled:cursor-not-allowed disabled:opacity-50"
        />
        
        {/* Suggestions Dropdown */}
        {status === 'OK' && (
          <ul className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#0A120E]/95 backdrop-blur-xl border border-white/10 rounded shadow-2xl z-50 overflow-hidden text-left">
            {data.map(({ place_id, description, structured_formatting }: any) => (
              <li
                key={place_id}
                onClick={handleSelect({ description })}
                className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
              >
                 <div className="flex flex-col">
                    <span className="text-white/90 font-medium text-sm truncate">{structured_formatting.main_text}</span>
                    <span className="text-white/50 text-xs truncate">{structured_formatting.secondary_text}</span>
                 </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PlacesAutocomplete;
