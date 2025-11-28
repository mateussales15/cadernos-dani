import React, { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Gestão de Recursos - Single-file React component (TailwindCSS assumed)
// Instalações sugeridas: react, react-dom, recharts, tailwindcss (configurado)

const SAMPLE_MATERIALS = [
  { id: 1, name: 'Aço', unit: 'kg', unitPrice: 5.2, quantityOnHand: 200 },
  { id: 2, name: 'Parafuso', unit: 'un', unitPrice: 0.12, quantityOnHand: 5000 },
];

const SAMPLE_PRODUCTIONS = [
  { id: 1, name: 'Produto A - Lote 01', date: '2025-11-01', materialCost: 420, laborCost: 300, otherCost: 50, unitsProduced: 100 },
  { id: 2, name: 'Produto B - Lote 02', date: '2025-11-15', materialCost: 120, laborCost: 80, otherCost: 20, unitsProduced: 40 },
];

const COLORS = ['#4F46E5', '#06B6D4', '#F59E0B', '#EF4444', '#10B981'];

function uid() {
  return Math.floor(Math.random() * 1000000);
}

export default function App() {
  const [materials, setMaterials] = useState(() => {
    const raw = localStorage.getItem('gr_materials');
    return raw ? JSON.parse(raw) : SAMPLE_MATERIALS;
  });
  const [productions, setProductions] = useState(() => {
    const raw = localStorage.getItem('gr_productions');
    return raw ? JSON.parse(raw) : SAMPLE_PRODUCTIONS;
  });

  const [selectedTab, setSelectedTab] = useState('dashboard');

  // Material form state
  const [matForm, setMatForm] = useState({ id: null, name: '', unit: '', unitPrice: '', quantityOnHand: '' });
  const [prodForm, setProdForm] = useState({ id: null, name: '', date: '', materialCost: '', laborCost: '', otherCost: '', unitsProduced: '' });

  useEffect(() => {
    localStorage.setItem('gr_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('gr_productions', JSON.stringify(productions));
  }, [productions]);

  // Helpers
  const totalMaterialValue = materials.reduce((s, m) => s + (Number(m.unitPrice) * Number(m.quantityOnHand || 0)), 0);
  const totalProductionCost = productions.reduce((s, p) => s + Number(p.materialCost || 0) + Number(p.laborCost || 0) + Number(p.otherCost || 0), 0);

  // CRUD for materials
  function saveMaterial(e) {
    e && e.preventDefault();
    const parsed = { ...matForm, unitPrice: Number(matForm.unitPrice || 0), quantityOnHand: Number(matForm.quantityOnHand || 0) };
    if (!parsed.name) return alert('Nome do material é obrigatório');

    if (parsed.id) {
      setMaterials(materials.map(m => (m.id === parsed.id ? parsed : m)));
    } else {
      parsed.id = uid();
      setMaterials([parsed, ...materials]);
    }
    setMatForm({ id: null, name: '', unit: '', unitPrice: '', quantityOnHand: '' });
  }

  function editMaterial(m) {
    setMatForm({ ...m });
    setSelectedTab('materials');
  }

  function removeMaterial(id) {
    if (!confirm('Remover material?')) return;
    setMaterials(materials.filter(m => m.id !== id));
  }

  // CRUD for productions
  function saveProduction(e) {
    e && e.preventDefault();
    const parsed = {
      ...prodForm,
      materialCost: Number(prodForm.materialCost || 0),
      laborCost: Number(prodForm.laborCost || 0),
      otherCost: Number(prodForm.otherCost || 0),
      unitsProduced: Number(prodForm.unitsProduced || 0),
    };
    if (!parsed.name || !parsed.date) return alert('Nome e data são obrigatórios');

    if (parsed.id) {
      setProductions(productions.map(p => (p.id === parsed.id ? parsed : p)));
    } else {
      parsed.id = uid();
      setProductions([parsed, ...productions]);
    }
    setProdForm({ id: null, name: '', date: '', materialCost: '', laborCost: '', otherCost: '', unitsProduced: '' });
  }

  function editProduction(p) {
    setProdForm({ ...p });
    setSelectedTab('productions');
  }

  function removeProduction(id) {
    if (!confirm('Remover produção?')) return;
    setProductions(productions.filter(p => p.id !== id));
  }

  // Export CSV simple
  function exportCSV() {
    const headerMat = ['id', 'name', 'unit', 'unitPrice', 'quantityOnHand'];
    const rowsMat = materials.map(m => [m.id, m.name, m.unit, m.unitPrice, m.quantityOnHand].join(','));
    const headerProd = ['id', 'name', 'date', 'materialCost', 'laborCost', 'otherCost', 'unitsProduced'];
    const rowsProd = productions.map(p => [p.id, p.name, p.date, p.materialCost, p.laborCost, p.otherCost, p.unitsProduced].join(','));

    const csv = `--Materials--\n${headerMat.join(',')}\n${rowsMat.join('\n')}\n\n--Productions--\n${headerProd.join(',')}\n${rowsProd.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gestao_recursos_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Small charts data
  const monthly = productions
    .slice()
    .reverse()
    .map(p => ({ name: p.date, cost: Number(p.materialCost || 0) + Number(p.laborCost || 0) + Number(p.otherCost || 0) }));

  const materialPie = materials.map((m, i) => ({ name: m.name, value: Number(m.unitPrice || 0) * Number(m.quantityOnHand || 0) }));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-6 gap-4">
        <aside className="md:col-span-1 bg-white rounded-2xl p-4 shadow">
          <h2 className="text-xl font-bold mb-2">Gestão de Recursos</h2>
          <p className="text-sm text-gray-500 mb-4">Gerencie materiais e custos de produção</p>
          <nav className="space-y-2">
            <button onClick={() => setSelectedTab('dashboard')} className={`w-full text-left px-3 py-2 rounded ${selectedTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>Dashboard</button>
            <button onClick={() => setSelectedTab('materials')} className={`w-full text-left px-3 py-2 rounded ${selectedTab === 'materials' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>Materiais</button>
            <button onClick={() => setSelectedTab('productions')} className={`w-full text-left px-3 py-2 rounded ${selectedTab === 'productions' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>Produção</button>
            <button onClick={() => { setSelectedTab('settings'); }} className={`w-full text-left px-3 py-2 rounded ${selectedTab === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>Configurações & Export</button>
          </nav>

          <div className="mt-6 text-sm text-gray-600">
            <p>Total valor materiais: <strong>R$ {totalMaterialValue.toFixed(2)}</strong></p>
            <p>Total custo produção: <strong>R$ {totalProductionCost.toFixed(2)}</strong></p>
          </div>
        </aside>

        <main className="md:col-span-5">
          <div className="bg-white rounded-2xl p-4 shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold">{selectedTab === 'dashboard' ? 'Dashboard' : selectedTab === 'materials' ? 'Materiais' : selectedTab === 'productions' ? 'Produções' : 'Configurações'}</h1>
              <div className="space-x-2">
                <button onClick={() => { setMatForm({ id: null, name: '', unit: '', unitPrice: '', quantityOnHand: '' }); setSelectedTab('materials'); }} className="px-3 py-1 rounded bg-green-500 text-white text-sm">+ Material</button>
                <button onClick={() => { setProdForm({ id: null, name: '', date: '', materialCost: '', laborCost: '', otherCost: '', unitsProduced: '' }); setSelectedTab('productions'); }} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">+ Produção</button>
              </div>
            </div>

            {/* Content */}
            {selectedTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h3 className="font-medium">Resumo rápido</h3>
                  <p className="mt-2 text-sm">Valor total em materiais: <strong>R$ {totalMaterialValue.toFixed(2)}</strong></p>
                  <p className="mt-1 text-sm">Custos totais de produção: <strong>R$ {totalProductionCost.toFixed(2)}</strong></p>
                  <p className="mt-1 text-sm">Produções registradas: <strong>{productions.length}</strong></p>
                </div>

                <div className="p-4 border rounded md:col-span-2">
                  <h3 className="font-medium">Custo por mês (últimos)</h3>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={monthly.length ? monthly : [{ name: 'sem dados', cost: 0 }] }>
                        <Line type="monotone" dataKey="cost" stroke="#4F46E5" strokeWidth={3} />
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-4 border rounded md:col-span-1">
                  <h3 className="font-medium">Distribuição do valor dos materiais</h3>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={materialPie} dataKey="value" nameKey="name" innerRadius={30} outerRadius={70}>
                          {materialPie.map((entry, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}

            {selectedTab === 'materials' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 p-4 border rounded">
                  <h3 className="font-medium mb-2">Adicionar / Editar Material</h3>
                  <form onSubmit={saveMaterial} className="space-y-2">
                    <input className="w-full p-2 rounded border" placeholder="Nome" value={matForm.name} onChange={e => setMatForm({ ...matForm, name: e.target.value })} />
                    <input className="w-full p-2 rounded border" placeholder="Unidade (ex: kg, un)" value={matForm.unit} onChange={e => setMatForm({ ...matForm, unit: e.target.value })} />
                    <input type="number" step="0.01" className="w-full p-2 rounded border" placeholder="Preço unitário" value={matForm.unitPrice} onChange={e => setMatForm({ ...matForm, unitPrice: e.target.value })} />
                    <input type="number" className="w-full p-2 rounded border" placeholder="Quantidade em estoque" value={matForm.quantityOnHand} onChange={e => setMatForm({ ...matForm, quantityOnHand: e.target.value })} />
                    <div className="flex gap-2">
                      <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded">Salvar</button>
                      <button type="button" onClick={() => setMatForm({ id: null, name: '', unit: '', unitPrice: '', quantityOnHand: '' })} className="px-3 py-1 border rounded">Limpar</button>
                    </div>
                  </form>
                </div>

                <div className="md:col-span-2 p-4 border rounded overflow-auto">
                  <h3 className="font-medium mb-2">Lista de Materiais</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th>Nome</th>
                        <th>Unidade</th>
                        <th>Preço unit.</th>
                        <th>Estoque</th>
                        <th>Valor total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map(m => (
                        <tr key={m.id} className="border-t">
                          <td>{m.name}</td>
                          <td>{m.unit}</td>
                          <td>R$ {Number(m.unitPrice).toFixed(2)}</td>
                          <td>{m.quantityOnHand}</td>
                          <td>R$ {(Number(m.unitPrice) * Number(m.quantityOnHand || 0)).toFixed(2)}</td>
                          <td className="space-x-2">
                            <button onClick={() => editMaterial(m)} className="text-blue-600">Editar</button>
                            <button onClick={() => removeMaterial(m.id)} className="text-red-600">Remover</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTab === 'productions' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 p-4 border rounded">
                  <h3 className="font-medium mb-2">Registrar Produção</h3>
                  <form onSubmit={saveProduction} className="space-y-2">
                    <input className="w-full p-2 rounded border" placeholder="Nome do lote" value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} />
                    <input type="date" className="w-full p-2 rounded border" value={prodForm.date} onChange={e => setProdForm({ ...prodForm, date: e.target.value })} />
                    <input type="number" step="0.01" className="w-full p-2 rounded border" placeholder="Custo material" value={prodForm.materialCost} onChange={e => setProdForm({ ...prodForm, materialCost: e.target.value })} />
                    <input type="number" step="0.01" className="w-full p-2 rounded border" placeholder="Custo mão de obra" value={prodForm.laborCost} onChange={e => setProdForm({ ...prodForm, laborCost: e.target.value })} />
                    <input type="number" step="0.01" className="w-full p-2 rounded border" placeholder="Outros custos" value={prodForm.otherCost} onChange={e => setProdForm({ ...prodForm, otherCost: e.target.value })} />
                    <input type="number" className="w-full p-2 rounded border" placeholder="Unidades produzidas" value={prodForm.unitsProduced} onChange={e => setProdForm({ ...prodForm, unitsProduced: e.target.value })} />
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-indigo-600 text-white rounded">Salvar</button>
                      <button type="button" onClick={() => setProdForm({ id: null, name: '', date: '', materialCost: '', laborCost: '', otherCost: '', unitsProduced: '' })} className="px-3 py-1 border rounded">Limpar</button>
                    </div>
                  </form>
                </div>

                <div className="md:col-span-2 p-4 border rounded overflow-auto">
                  <h3 className="font-medium mb-2">Lista de Produções</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th>Nome</th>
                        <th>Data</th>
                        <th>Custo material</th>
                        <th>Mão de obra</th>
                        <th>Outros</th>
                        <th>Unid.</th>
                        <th>Custo total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {productions.map(p => (
                        <tr key={p.id} className="border-t">
                          <td>{p.name}</td>
                          <td>{p.date}</td>
                          <td>R$ {Number(p.materialCost).toFixed(2)}</td>
                          <td>R$ {Number(p.laborCost).toFixed(2)}</td>
                          <td>R$ {Number(p.otherCost).toFixed(2)}</td>
                          <td>{p.unitsProduced}</td>
                          <td>R$ {(Number(p.materialCost || 0) + Number(p.laborCost || 0) + Number(p.otherCost || 0)).toFixed(2)}</td>
                          <td className="space-x-2">
                            <button onClick={() => editProduction(p)} className="text-blue-600">Editar</button>
                            <button onClick={() => removeProduction(p.id)} className="text-red-600">Remover</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTab === 'settings' && (
              <div className="p-4 border rounded">
                <h3 className="font-medium mb-2">Exportar / Configurações</h3>
                <div className="space-y-2">
                  <button onClick={exportCSV} className="px-3 py-1 bg-gray-800 text-white rounded">Exportar CSV</button>
                  <button onClick={() => { localStorage.removeItem('gr_materials'); localStorage.removeItem('gr_productions'); setMaterials([]); setProductions([]); }} className="px-3 py-1 border rounded">Limpar todos dados locais</button>
                  <p className="text-sm text-gray-500 mt-2">Observação: os dados são salvos no armazenamento local do navegador. Para uso em equipe, recomendo conectar um backend (Node/Express + banco de dados) ou usar um serviço como Supabase / Firebase.</p>
                </div>
              </div>
            )}

          </div>

          <div className="mt-4 text-xs text-gray-500">Dica: clique em um item para editar, use Exportar CSV para gerar relatórios simples.</div>
        </main>

      </div>
    </div>
  );
}
