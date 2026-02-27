import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import schemesData from '../data/schemes.json';
import SchemeCard from './SchemeCard';

interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  documents: string[];
  benefits: string;
  farmer_type: string[];
  category: string;
  state: string;
}

export default function GovernmentSchemes() {
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [farmerType, setFarmerType] = useState('All');
  const [category, setCategory] = useState('All');
  const [state, setState] = useState('All');
  const [sortOrder, setSortOrder] = useState('name-asc');

  useEffect(() => {
    // In a real app, you'd fetch this from an API
    setSchemes(schemesData as Scheme[]);
    setFilteredSchemes(schemesData as Scheme[]);
  }, []);

  useEffect(() => {
    let result = schemes;

    if (searchTerm) {
      result = result.filter(scheme => 
        scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (farmerType !== 'All') {
      result = result.filter(scheme => scheme.farmer_type.includes(farmerType));
    }

    if (category !== 'All') {
      result = result.filter(scheme => scheme.category === category);
    }

    // State filter would be more complex with a real API and state list

    if (sortOrder === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredSchemes(result);
  }, [searchTerm, farmerType, category, state, schemes]);

  return (
    <div className="p-8 bg-gradient-to-br from-[#5e35b1] to-[#311b92] min-h-screen text-white">
      <h1 className="text-4xl font-bold font-display mb-8 text-center">Government Schemes for Farmers</h1>
      
      {/* Search and Filters */}
      <div className="mb-8 p-6 bg-white/10 rounded-xl backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input 
            type="text"
            placeholder="Search by name or description..."
            className="w-full p-3 bg-white/10 text-white rounded-lg placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5e35b1] col-span-2"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-full p-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5e35b1]">
            <option value="name-asc">Sort by Name (A-Z)</option>
            <option value="name-desc">Sort by Name (Z-A)</option>
          </select>
          <select value={farmerType} onChange={e => setFarmerType(e.target.value)} className="w-full p-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5e35b1]">
            <option value="All">All Farmer Types</option>
            <option value="Small">Small</option>
            <option value="Marginal">Marginal</option>
            <option value="Tenant">Tenant</option>
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5e35b1]">
            <option value="All">All Categories</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Irrigation">Irrigation</option>
            <option value="Crop Insurance">Crop Insurance</option>
            <option value="Subsidy">Subsidy</option>
            <option value="Loans">Loans</option>
          </select>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredSchemes.map(scheme => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
      </div>
    </div>
  );
}
