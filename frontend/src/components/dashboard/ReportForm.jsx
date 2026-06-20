import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addReport } from '../redux/features/repPollutionSlice';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Pollution type icons
const pollutionIcons = {
  'burning-waste': new L.Icon({
    iconUrl: '/icons/burning-waste.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'industrial-emission': new L.Icon({
    iconUrl: '/icons/industrial-emission.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'vehicle-emission': new L.Icon({
    iconUrl: '/icons/vehicle-emission.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'water-pollution': new L.Icon({
    iconUrl: '/icons/water-pollution.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'deforestation': new L.Icon({
    iconUrl: '/icons/deforestation.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'noise-pollution': new L.Icon({
    iconUrl: '/icons/noise-pollution.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'default': new L.Icon({
    iconUrl: '/icons/default-pollution.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
};

const pollutionTypes = [
  { value: 'burning-waste', label: 'Burning Waste' },
  { value: 'industrial-emission', label: 'Industrial Emission' },
  { value: 'vehicle-emission', label: 'Vehicle Emission' },
  { value: 'water-pollution', label: 'Water Pollution' },
  { value: 'deforestation', label: 'Deforestation' },
  { value: 'noise-pollution', label: 'Noise Pollution' }
];

function LocationMarker({ position, setPosition, setAddress }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      
      // Reverse geocode to get address
      axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(response => {
          const address = response.data.display_name || 'Unknown location';
          setAddress(address);
        })
        .catch(error => {
          console.error('Error getting address:', error);
          setAddress('Selected location');
        });
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={pollutionIcons.default}>
      <Popup>Report location</Popup>
    </Marker>
  );
}

const ReportForm = () => {
  const dispatch = useDispatch();
  const [description, setDescription] = useState('');
  const [pollutionType, setPollutionType] = useState('burning-waste');
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!position) {
      toast.error('Please select a location on the map');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reportData = {
        description,
        pollutionType,
        location: JSON.stringify({
          address,
          coordinates: {
            lat: position.lat,
            lng: position.lng
          }
        })
      };
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('description', description);
      formData.append('pollutionType', pollutionType);
      formData.append('location', reportData.location);
      
      // Append images if any
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          formData.append('images', images[i]);
        }
      }
      
      await dispatch(addReport(formData));
      toast.success('Report submitted successfully!');
      
      // Reset form
      setDescription('');
      setPosition(null);
      setAddress('');
      setImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to submit report');
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Report Pollution</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pollution Type
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={pollutionType}
            onChange={(e) => setPollutionType(e.target.value)}
            required
          >
            {pollutionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the pollution issue..."
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="h-64 rounded-md overflow-hidden border border-gray-300">
            <MapContainer 
              center={[24.8607, 67.0011]} // Default to Karachi coordinates
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker 
                position={position} 
                setPosition={setPosition} 
                setAddress={setAddress} 
              />
            </MapContainer>
          </div>
          {address && (
            <p className="mt-2 text-sm text-gray-600">Selected: {address}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images (Optional)
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            multiple
            accept="image/*"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((image, index) => (
                <div key={index} className="w-20 h-20 border rounded-md overflow-hidden">
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isSubmitting || !position}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;