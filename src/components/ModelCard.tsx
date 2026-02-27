import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
  { name: 'Jan', value: 0.02 },
  { name: 'Feb', value: 0.025 },
  { name: 'Mar', value: 0.022 },
  { name: 'Apr', value: 0.03 },
  { name: 'May', value: 0.028 },
];

export interface ModelCardProps {
  name: string;
  accuracy: number;
  loss: number;
  latency: string;
  status: 'Active' | 'Inactive' | 'Training';
}

const statusColors = {
  Active: 'bg-green-500',
  Inactive: 'bg-gray-500',
  Training: 'bg-blue-500',
};

export default function ModelCard({ name, accuracy, loss, latency, status }: ModelCardProps) {
  return (
    <div className="glassmorphism rounded-2xl p-6 flex flex-col h-full glowing-border">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-white font-display">{name}</h3>
        <div className={`flex items-center space-x-2 text-xs font-semibold px-2 py-1 rounded-full ${statusColors[status]}`}>
          <div className={`w-2 h-2 rounded-full ${statusColors[status]}`}></div>
          <span>{status}</span>
        </div>
      </div>

      <div className="flex-grow mb-4 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <Line type="monotone" dataKey="value" stroke="#00c0ff" strokeWidth={2} dot={{ r: 4, fill: '#00c0ff' }} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 26, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
            <YAxis stroke="#888" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-gray-400 text-sm">Accuracy</p>
          <p className="text-white font-semibold text-lg">{accuracy}%</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Loss</p>
          <p className="text-white font-semibold text-lg">{loss}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Latency</p>
          <p className="text-white font-semibold text-lg">{latency}</p>
        </div>
      </div>
    </div>
  );
}
