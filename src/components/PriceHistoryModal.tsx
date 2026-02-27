import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CropPrice {
  id: number;
  crop: string;
  market: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  previous_modal_price?: number;
  unit: string;
  state: string;
  historical_data?: { date: string; price: number }[];
}

interface PriceHistoryModalProps {
  crop: CropPrice | null;
  onClose: () => void;
}

export default function PriceHistoryModal({ crop, onClose }: PriceHistoryModalProps) {
  if (!crop) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-display text-gray-800">Price History: {crop.crop}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={crop.historical_data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#16a34a" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
