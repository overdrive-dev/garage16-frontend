'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';

export default function EditarMoto() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    ano: '',
    km: '',
    cor: '',
    preco: '',
    descricao: '',
    fichaTecnica: {
      marca: '',
      modelo: '',
      cilindrada: '',
      potencia: '',
      combustivel: ''
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Adicionar dados básicos
      Object.keys(formData).forEach(key => {
        if (key === 'fichaTecnica') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Adicionar imagens
      images.forEach(image => {
        if (image instanceof File) {
          formDataToSend.append('imagens', image);
        }
      });

      const url = params.id === 'nova' 
        ? '/api/motos'
        : `/api/motos/${params.id}`;

      const method = params.id === 'nova' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Erro ao salvar moto');

      router.push('/admin/motos');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar moto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('fichaTecnica.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        fichaTecnica: {
          ...prev.fichaTecnica,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {params.id === 'nova' ? 'Nova Moto' : 'Editar Moto'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="block mb-1">Título</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className="w-full bg-gray-900 rounded p-2 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Ano</label>
              <input
                type="text"
                name="ano"
                value={formData.ano}
                onChange={handleChange}
                className="w-full bg-gray-900 rounded p-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Quilometragem</label>
              <input
                type="text"
                name="km"
                value={formData.km}
                onChange={handleChange}
                className="w-full bg-gray-900 rounded p-2 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Cor</label>
              <input
                type="text"
                name="cor"
                value={formData.cor}
                onChange={handleChange}
                className="w-full bg-gray-900 rounded p-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Preço</label>
              <input
                type="text"
                name="preco"
                value={formData.preco}
                onChange={handleChange}
                className="w-full bg-gray-900 rounded p-2 text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1">Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={4}
              className="w-full bg-gray-900 rounded p-2 text-white"
              required
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Ficha Técnica</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Marca</label>
              <input
                type="text"
                name="fichaTecnica.marca"
                value={formData.fichaTecnica.marca}
                onChange={handleChange}
                className="w-full bg-gray-900 rounded p-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Modelo</label>
              <input
                type="text"
                name="fichaTecnica.modelo"
                value={formData.fichaTecnica.modelo}
                onChange={handleChange}
                className="w-full bg-gray-900 rounded p-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Cilindrada</label>
              <input
                type="text"
                name="fichaTecnica.cilindrada"
                value={formData.fichaTecnica.cilindrada}
                onChange={handleChange}
                className="w-full bg-gray-900 rounded p-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Potência</label>
              <input
                type="text"
                name="fichaTecnica.potencia"
                value={formData.fichaTecnica.potencia}
                onChange={handleChange}
                className="w-full bg-gray-900 rounded p-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Combustível</label>
              <input
                type="text"
                name="fichaTecnica.combustivel"
                value={formData.fichaTecnica.combustivel}
                onChange={handleChange}
                className="w-full bg-gray-900 rounded p-2 text-white"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Imagens</h2>
          <ImageUpload
            images={images}
            onChange={setImages}
            maxImages={10}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#FD4308] hover:bg-[#e63d07] text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
} 