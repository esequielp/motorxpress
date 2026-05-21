import React, { useEffect, useState, useRef } from 'react';
import { Package, Users, ShoppingCart, Settings as SettingsIcon, Plus, Edit, Trash2, Save, X, DollarSign, TrendingUp, AlertTriangle, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Upload, Code, Eye, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useNavigate } from 'react-router-dom';
import { getProductImages } from '../../lib/utils/image';
import { useThemeStore } from '../../store/theme';

function ProductFormModal({ editingProduct, onClose, onSubmit, products }: any) {
  const [isOffer, setIsOffer] = useState(!!editingProduct?.is_offer);
  const [images, setImages] = useState<string[]>(getProductImages(editingProduct?.image));
  const [isUploading, setIsUploading] = useState(false);
  const [productType, setProductType] = useState(editingProduct?.type || 'simple');
  
  const [variations, setVariations] = useState<any[]>(editingProduct?.variations || []);
  const [comboItems, setComboItems] = useState<any[]>(
    editingProduct?.combo_items 
      ? editingProduct.combo_items.map((i: any) => ({ product_id: i.product_id, quantity: i.quantity }))
      : []
  );
  
  const [comboSearchQueries, setComboSearchQueries] = useState<Record<number, string>>({});
  
  const [crossSells, setCrossSells] = useState<string[]>(
    editingProduct?.cross_sell_ids 
      ? editingProduct.cross_sell_ids.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []
  );
  const [crossSellSearch, setCrossSellSearch] = useState<string | undefined>(undefined);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        setImages(prev => [...prev, data.url]);
      }
    } catch (err) {
      console.error('Error uploading image', err);
      alert('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const addVariation = () => {
    setVariations([...variations, { id: `v${Date.now()}`, sku: '', name: '', price: 0, stock: 0, image: '' }]);
  };

  const updateVariation = (index: number, field: string, value: any) => {
    const newVars = [...variations];
    newVars[index][field] = value;
    setVariations(newVars);
  };

  const removeVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const addComboItem = () => {
    setComboItems([...comboItems, { product_id: '', quantity: 1 }]);
  };

  const updateComboItem = (index: number, field: string, value: any) => {
    const newItems = [...comboItems];
    newItems[index][field] = value;
    setComboItems(newItems);
  };

  const removeComboItem = (index: number) => {
    setComboItems(comboItems.filter((_, i) => i !== index));
    const newQueries = { ...comboSearchQueries };
    delete newQueries[index];
    setComboSearchQueries(newQueries);
  };

  const handleVariationImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        updateVariation(index, 'image', data.url);
      }
    } catch (err) {
      console.error('Error uploading image', err);
      alert('Error al subir la imagen de la variante');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-theme-card border border-theme-border rounded-lg max-w-2xl w-full p-6 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bebas text-white mb-6">
          {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Nombre</label>
                   <input name="name" defaultValue={editingProduct?.name} required className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary" />
                 </div>
                 <div>
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">SKU</label>
                   <input name="sku" defaultValue={editingProduct?.sku} required className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary font-mono" />
                 </div>
                 <div>
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">MPN (Número de Parte)</label>
                   <input name="mpn" defaultValue={editingProduct?.mpn || ''} className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary font-mono" placeholder="Opcional" />
                 </div>
                 <div>
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Precio Unitario Base</label>
                   <input name="price" type="number" defaultValue={editingProduct?.price || 0} required className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary" />
                 </div>
                 <div>
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Costo Base</label>
                   <input name="cost" type="number" defaultValue={editingProduct?.cost || 0} required className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary" />
                 </div>
                 <div>
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Stock Base</label>
                   <input name="stock" type="number" defaultValue={editingProduct?.stock || 0} required className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary" />
                 </div>
                 <div className="col-span-2">
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Vehículo de Compatibilidad</label>
                   <input name="vehicle" defaultValue={editingProduct?.vehicle || 'Universal'} required className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary" />
                 </div>

                 <div className="col-span-2">
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Tipo de Producto</label>
                   <select 
                     name="type" 
                     className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary"
                     value={productType}
                     onChange={(e) => setProductType(e.target.value)}
                   >
                     <option value="simple">Simple</option>
                     <option value="variable">Variables / Configurable</option>
                     <option value="combo">Combo / Bundle</option>
                   </select>
                 </div>

                 {productType === 'variable' && (
                   <div className="col-span-2 bg-theme-base border border-theme-border rounded-lg p-4">
                     <label className="block text-xs uppercase text-gray-500 font-bold mb-3">Configuración de Variaciones</label>
                     <input type="hidden" name="variations" value={JSON.stringify(variations)} />
                     <div className="space-y-3">
                       {variations.map((v, index) => (
                         <div key={v.id || index} className="flex flex-wrap md:flex-nowrap gap-2 items-start bg-theme-card p-3 rounded border border-theme-border relative">
                           <button type="button" onClick={() => removeVariation(index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 w-6 h-6 flex items-center justify-center">
                             <X size={12} />
                           </button>
                           <div className="flex-1 min-w-[120px]">
                             <label className="block text-[10px] text-gray-500 mb-1">SKU</label>
                             <input value={v.sku} onChange={e => updateVariation(index, 'sku', e.target.value)} className="w-full bg-theme-base border border-theme-border p-1.5 rounded text-white text-sm" placeholder="SKU-VAR" />
                           </div>
                           <div className="flex-1 min-w-[150px]">
                             <label className="block text-[10px] text-gray-500 mb-1">Nombre Variante</label>
                             <input value={v.name} onChange={e => updateVariation(index, 'name', e.target.value)} className="w-full bg-theme-base border border-theme-border p-1.5 rounded text-white text-sm" placeholder="Talla M - Rojo" />
                           </div>
                           <div className="w-24">
                             <label className="block text-[10px] text-gray-500 mb-1">Precio</label>
                             <input type="number" value={v.price} onChange={e => updateVariation(index, 'price', Number(e.target.value))} className="w-full bg-theme-base border border-theme-border p-1.5 rounded text-white text-sm" />
                           </div>
                           <div className="w-20">
                             <label className="block text-[10px] text-gray-500 mb-1">Stock</label>
                             <input type="number" value={v.stock} onChange={e => updateVariation(index, 'stock', Number(e.target.value))} className="w-full bg-theme-base border border-theme-border p-1.5 rounded text-white text-sm" />
                           </div>
                           <div className="w-full md:w-32">
                             <label className="block text-[10px] text-gray-500 mb-1">Imagen</label>
                             <div className="flex gap-2 items-center">
                               {v.image && <img src={v.image} className="w-8 h-8 object-cover rounded bg-theme-base border border-theme-border shrink-0" alt="var" />}
                               <label className="flex-1 bg-theme-element hover:bg-theme-primary text-white p-1.5 rounded cursor-pointer transition flex items-center justify-center text-[10px]" title="Subir Imagen">
                                 <Plus size={14} className="mr-1" /> Subir
                                 <input type="file" accept="image/*" onChange={(e) => handleVariationImageUpload(index, e)} className="hidden" />
                               </label>
                             </div>
                           </div>
                         </div>
                       ))}
                       <button type="button" onClick={addVariation} className="flex items-center gap-1 text-sm bg-theme-element hover:bg-theme-primary px-3 py-1.5 rounded text-white transition">
                         <Plus size={14} /> Añadir Variante
                       </button>
                     </div>
                   </div>
                 )}

                 {productType === 'combo' && (
                   <div className="col-span-2 bg-theme-base border border-theme-border rounded-lg p-4">
                     <label className="block text-xs uppercase text-gray-500 font-bold mb-3">Productos del Bundle</label>
                     <input type="hidden" name="combo_items" value={JSON.stringify(comboItems)} />
                     <div className="space-y-3">
                       {comboItems.map((item, index) => (
                         <div key={index} className="flex gap-2 items-end bg-theme-card p-3 rounded border border-theme-border relative">
                           <button type="button" onClick={() => removeComboItem(index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 w-6 h-6 flex items-center justify-center">
                             <X size={12} />
                           </button>
                           <div className="flex-1 group/combo">
                             <label className="block text-[10px] text-gray-500 mb-1">Producto (Buscar por SKU/Nombre)</label>
                             <div className="flex items-center gap-2 relative">
                               <input 
                                 type="text"
                                 placeholder="Escribe para buscar..."
                                 value={comboSearchQueries[index] !== undefined ? comboSearchQueries[index] : (products?.find((p:any) => p.id === item.product_id)?.name || '')}
                                 onChange={e => setComboSearchQueries({...comboSearchQueries, [index]: e.target.value})}
                                 onFocus={() => {
                                   if (comboSearchQueries[index] === undefined) {
                                      setComboSearchQueries({...comboSearchQueries, [index]: ''});
                                   }
                                 }}
                                 className="w-full bg-theme-base border border-theme-border p-1.5 rounded text-white text-sm focus:border-theme-primary transition-colors outline-none"
                               />
                               {comboSearchQueries[index] !== undefined && (
                                 <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-theme-card border border-theme-border shadow-2xl max-h-48 overflow-y-auto rounded text-sm hidden group-focus-within/combo:block">
                                   {products?.filter((p:any) => p.id !== editingProduct?.id && (!comboSearchQueries[index] || p.name.toLowerCase().includes(comboSearchQueries[index].toLowerCase()) || p.sku.toLowerCase().includes(comboSearchQueries[index].toLowerCase()))).slice(0, 20).map((p: any) => (
                                     <div 
                                       key={p.id}
                                       className="p-2 hover:bg-theme-element cursor-pointer border-b border-theme-border/50 text-white flex justify-between"
                                       onMouseDown={(e) => {
                                         e.preventDefault();
                                         updateComboItem(index, 'product_id', p.id);
                                         setComboSearchQueries({...comboSearchQueries, [index]: undefined});
                                       }}
                                     >
                                       <span className="truncate">{p.name}</span> <span className="text-xs text-gray-400 shrink-0 ml-2">{p.sku}</span>
                                     </div>
                                   ))}
                                   {products?.filter((p:any) => p.id !== editingProduct?.id && (!comboSearchQueries[index] || p.name.toLowerCase().includes(comboSearchQueries[index].toLowerCase()) || p.sku.toLowerCase().includes(comboSearchQueries[index].toLowerCase()))).length === 0 && (
                                     <div className="p-2 text-gray-500 italic text-center">No hay resultados</div>
                                   )}
                                 </div>
                               )}
                               {item.product_id && (
                                 <div className="shrink-0 text-[10px] text-theme-primary font-mono bg-theme-primary/10 px-2 py-1 rounded" title="ID">#{item.product_id}</div>
                               )}
                             </div>
                           </div>
                           <div className="w-24">
                             <label className="block text-[10px] text-gray-500 mb-1">Cantidad</label>
                             <input type="number" value={item.quantity} onChange={e => updateComboItem(index, 'quantity', parseInt(e.target.value) || 1)} className="w-full bg-theme-base border border-theme-border p-1.5 rounded text-white text-sm" min="1" />
                           </div>
                         </div>
                       ))}
                       <button type="button" onClick={addComboItem} className="flex items-center gap-1 text-sm bg-theme-element hover:bg-theme-primary px-3 py-1.5 rounded text-white transition">
                         <Plus size={14} /> Añadir Producto al Bundle
                       </button>
                     </div>
                   </div>
                 )}

                 <div className="col-span-2">
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Imágenes del Producto Base</label>
                   <div className="flex flex-col gap-4 relative">
                     {images.length > 0 && (
                       <div className="flex flex-wrap gap-2">
                         {images.map((imgUrl, i) => (
                           <div key={i} className="w-24 h-24 rounded bg-theme-base border border-theme-border overflow-hidden relative group">
                             <img src={imgUrl} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                             <button 
                               type="button"
                               onClick={() => setImages(images.filter((_, index) => index !== i))}
                               className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-5 w-5"
                             >
                               <X size={12} />
                             </button>
                             {i === 0 && (
                               <span className="absolute bottom-0 left-0 right-0 bg-black/80 text-[10px] text-center py-0.5 text-white">Principal</span>
                             )}
                           </div>
                         ))}
                       </div>
                     )}
                     <div className="flex gap-2 items-center">
                       <input type="hidden" name="image" value={JSON.stringify(images)} />
                       <label className="bg-theme-element hover:bg-[#2A2A35] text-white px-4 py-2 rounded cursor-pointer transition flex items-center justify-center whitespace-nowrap">
                         {isUploading ? 'Subiendo...' : 'Subir Imagen'}
                         <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="hidden" />
                       </label>
                       <span className="text-xs text-gray-500">Puedes subir múltiples imágenes. La primera será la principal.</span>
                     </div>
                   </div>
                 </div>

                 <div className="col-span-2">
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Descripción Técnica</label>
                   <textarea name="description" rows={3} defaultValue={editingProduct?.description || ''} className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary resize-none" placeholder="Ingresa la descripción del producto..." />
                 </div>
                 
                 <div className="col-span-2">
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Venta Cruzada Manual (Búsqueda por Nombre o SKU)</label>
                   <input type="hidden" name="cross_sell_ids" value={crossSells.join(', ')} />
                   
                   <div className="flex flex-wrap gap-2 mb-2">
                     {crossSells.map((sku, index) => {
                       const linkedProduct = products?.find((p: any) => p.sku === sku || p.mpn === sku);
                       return (
                         <div key={index} className="flex items-center gap-1 bg-theme-element text-white px-2 py-1 rounded text-sm">
                           <span>{linkedProduct ? linkedProduct.name : sku}</span>
                           <button type="button" onClick={() => setCrossSells(crossSells.filter((_, i) => i !== index))} className="hover:text-red-400 ml-1">
                             <X size={14} />
                           </button>
                         </div>
                       );
                     })}
                   </div>

                   <div className="relative group/cross">
                     <input 
                       type="text"
                       placeholder="Escribre para buscar y añadir productos..."
                       value={crossSellSearch || ''}
                       onChange={(e) => setCrossSellSearch(e.target.value)}
                       onFocus={() => { if (crossSellSearch === undefined) setCrossSellSearch(''); }}
                       className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary" 
                     />
                     
                     {crossSellSearch !== undefined && (
                       <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-theme-card border border-theme-border shadow-2xl max-h-48 overflow-y-auto rounded text-sm hidden group-focus-within/cross:block">
                         {products?.filter((p:any) => p.id !== editingProduct?.id && !crossSells.includes(p.sku) && (!crossSellSearch || p.name.toLowerCase().includes(crossSellSearch.toLowerCase()) || p.sku.toLowerCase().includes(crossSellSearch.toLowerCase()))).slice(0, 20).map((p: any) => (
                           <div 
                             key={p.id}
                             className="p-2 hover:bg-theme-element cursor-pointer border-b border-theme-border/50 text-white flex justify-between"
                             onMouseDown={(e) => {
                               e.preventDefault();
                               if (p.sku && !crossSells.includes(p.sku)) {
                                 setCrossSells([...crossSells, p.sku]);
                               }
                               setCrossSellSearch(undefined);
                             }}
                           >
                             <span className="truncate">{p.name}</span> <span className="text-xs text-gray-400 shrink-0 ml-2">{p.sku}</span>
                           </div>
                         ))}
                         {products?.filter((p:any) => p.id !== editingProduct?.id && !crossSells.includes(p.sku) && (!crossSellSearch || p.name.toLowerCase().includes(crossSellSearch.toLowerCase()) || p.sku.toLowerCase().includes(crossSellSearch.toLowerCase()))).length === 0 && (
                           <div className="p-2 text-gray-500 italic text-center">No hay resultados</div>
                         )}
                       </div>
                     )}
                   </div>
                 </div>
                 
                 <div className="col-span-2 flex flex-wrap gap-6 items-center mt-2 p-4 bg-theme-base border border-theme-border rounded-lg">
                   <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                     <input type="checkbox" name="is_featured" value="1" defaultChecked={editingProduct?.is_featured} className="accent-theme-primary w-4 h-4 cursor-pointer" />
                     Destacado (Home)
                   </label>
                   <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                     <input type="checkbox" name="is_offer" value="1" checked={isOffer} onChange={(e) => setIsOffer(e.target.checked)} className="accent-theme-primary w-4 h-4 cursor-pointer" />
                     En Oferta
                   </label>
                   <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                     <input type="checkbox" name="is_new" value="1" defaultChecked={editingProduct?.is_new} className="accent-theme-primary w-4 h-4 cursor-pointer" />
                     Recién Llegado
                   </label>
                   
                   {isOffer && (
                     <div className="w-full mt-2 transition-all">
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Precio de Oferta</label>
                        <input name="offer_price" type="number" defaultValue={editingProduct?.offer_price || ''} className="w-full bg-theme-card border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary" placeholder="Ej: 15000" />
                     </div>
                   )}
                 </div>
                 <input name="category_id" type="hidden" value="1" />
                 <input name="brand_id" type="hidden" value="1" />
               </div>
               
               <div className="pt-4 flex flex-row-reverse gap-4">
                 <button type="submit" className="bg-theme-primary text-white px-6 py-2 rounded font-bold hover:bg-theme-primary-hover transition">
                   {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                 </button>
                 <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white font-bold transition">
                   Cancelar
                 </button>
               </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userFilter, setUserFilter] = useState<'all' | 'staff' | 'customers'>('all');

  // Filtering & Pagination State
  const [productSearch, setProductSearch] = useState('');
  const [productPage, setProductPage] = useState(1);
  const itemsPerPage = 8;

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderPage, setOrderPage] = useState(1);

  const [userSearchText, setUserSearchText] = useState('');
  const [userPage, setUserPage] = useState(1);

  const [newsletterSearch, setNewsletterSearch] = useState('');
  const [newsletterPage, setNewsletterPage] = useState(1);
  
  const [pages, setPages] = useState<any[]>([]);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [pageSearch, setPageSearch] = useState('');
  const [pageToDeleteConfirm, setPageToDeleteConfirm] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorTab, setEditorTab] = useState<'visual' | 'html'>('visual');
  const editorRef = useRef<HTMLDivElement>(null);
  const editorImageInputRef = useRef<HTMLInputElement>(null);

  // Computed state
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );
  const paginatedProducts = filteredProducts.slice((productPage - 1) * itemsPerPage, productPage * itemsPerPage);
  const totalProductPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  const filteredOrders = orders.filter(o => 
    (o.id.toString().includes(orderSearch) || 
     o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) || 
     o.customer_email.toLowerCase().includes(orderSearch.toLowerCase())) &&
    (orderStatusFilter === 'all' || o.status === orderStatusFilter)
  );
  const paginatedOrders = filteredOrders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage);
  const totalOrderPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;

  const activeUsers = users.filter((u: any) => userFilter === 'all' || (userFilter === 'staff' && (u.role === 'admin' || u.role === 'ejecutivo')) || (userFilter === 'customers' && u.role === 'customer'));
  const filteredUsers = activeUsers.filter(u =>
    u.name.toLowerCase().includes(userSearchText.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearchText.toLowerCase()) ||
    u.id.toString().includes(userSearchText)
  );
  const paginatedUsers = filteredUsers.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);
  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

  const mockNewsletters = [
    { email: 'juan.perez@example.com', date: '10 May 2026', status: 'Activo' },
    { email: 'maria_c89@gmail.com', date: '11 May 2026', status: 'Activo' },
    { email: 'luis.mecanica@taller.cl', date: '12 May 2026', status: 'Activo' },
    { email: 'carlos123@hotmail.com', date: '13 May 2026', status: 'Desuscrito' },
    { email: 'ana.silva@empresa.com', date: '14 May 2026', status: 'Activo' },
    { email: 'roberto_xd@live.com', date: '14 May 2026', status: 'Activo' },
    { email: 'sofia.taller3x@gmail.com', date: '15 May 2026', status: 'Activo' },
    { email: 'miguel.lopez99@yahoo.com', date: '15 May 2026', status: 'Desuscrito' },
    { email: 'valeria_motors@gmail.com', date: '15 May 2026', status: 'Activo' },
  ];
  
  const filteredNewsletters = mockNewsletters.filter(n => n.email.toLowerCase().includes(newsletterSearch.toLowerCase()) || n.status.toLowerCase().includes(newsletterSearch.toLowerCase()));
  const paginatedNewsletters = filteredNewsletters.slice((newsletterPage - 1) * itemsPerPage, newsletterPage * itemsPerPage);
  const totalNewsletterPages = Math.ceil(filteredNewsletters.length / itemsPerPage) || 1;


  // Modals state
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Compute Dashboard Metrics
  const totalRevenue = orders.reduce((acc, current) => {
    if (current.status !== 'cancelled' && current.status !== 'rejected') {
      return acc + current.total;
    }
    return acc;
  }, 0);

  const lowStockProducts = products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 5);
  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  const chartData = [
    { name: 'Lun', ventas: Math.floor(Math.random() * 500000) + 100000 },
    { name: 'Mar', ventas: Math.floor(Math.random() * 500000) + 100000 },
    { name: 'Mié', ventas: Math.floor(Math.random() * 500000) + 100000 },
    { name: 'Jue', ventas: Math.floor(Math.random() * 500000) + 100000 },
    { name: 'Vie', ventas: Math.floor(Math.random() * 500000) + 100000 },
    { name: 'Sáb', ventas: Math.floor(Math.random() * 500000) + 100000 },
    { name: 'Dom', ventas: Math.floor(Math.random() * 500000) + 100000 },
  ];

  useEffect(() => {
    const savedUserStr = localStorage.getItem('motorxpress_user');
    if (savedUserStr) {
      const u = JSON.parse(savedUserStr);
      if (u.role === 'admin' || u.role === 'ejecutivo') {
        setCurrentUser(u);
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }

    fetch('/api/products').then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : []));
    fetch('/api/orders').then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : []));
    fetch('/api/users').then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : []));
    fetch('/api/settings').then(r => r.json()).then(d => setSettings(d || {}));
    fetch('/api/pages').then(r => r.json()).then(d => setPages(Array.isArray(d) ? d : []));
  }, []);

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    await fetch(`/api/products/${productToDelete.id}`, { method: 'DELETE' });
    setProducts(products.filter(p => p.id !== productToDelete.id));
    setProductToDelete(null);
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    setUsers(users.filter(u => u.id !== id));
  };

  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (editingUser) {
      await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
    } else {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      setUsers([{ id: result.id, ...data, created_at: new Date().toISOString() }, ...users]);
    }
    setUserModalOpen(false);
    setEditingUser(null);
  };


  const handleUpdateOrderStatus = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Error en el servidor');
      if (settings.theme) {
        setTheme(settings.theme);
      }
      setSaveSuccess('Configuraciones guardadas exitosamente.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Error de red al guardar');
    }
  };

  // Keep editor content in sync when editor is opened
  useEffect(() => {
    if (editingPage) {
      setEditorContent(editingPage.content || '');
      setEditorTab('visual');
    }
  }, [editingPage]);

  // Keep ref content in sync when entering visual tab
  useEffect(() => {
    if (editorTab === 'visual' && editorRef.current && editingPage) {
      // Small timeout to ensure DOM ref is fully ready
      const timer = setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = editorContent;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [editorTab, editingPage]);

  const handleFormat = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Ingrese el enlace URL (ej: https://example.com):');
    if (url) {
      handleFormat('createLink', url);
    }
  };

  const handleInsertImageUrl = () => {
    const url = prompt('Ingrese la URL de la imagen:');
    if (url) {
      handleFormat('insertImage', url);
    }
  };

  const handleEditorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        if (editorRef.current) {
          editorRef.current.focus();
        }
        document.execCommand('insertImage', false, data.url);
        if (editorRef.current) {
          setEditorContent(editorRef.current.innerHTML);
        }
      }
    } catch (err) {
      console.error('Error uploading inline image', err);
      alert('Error al subir la imagen');
    }
  };

  const handleSavePage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess('');
    
    const formData = new FormData(e.currentTarget);
    const titleVal = formData.get('title') as string;
    const slugVal = formData.get('slug') as string;
    
    // Get correct content depending on current active tab
    let finalContent = editorContent;
    if (editorTab === 'visual' && editorRef.current) {
      finalContent = editorRef.current.innerHTML;
    }
    
    try {
      const res = await fetch(`/api/pages/${slugVal}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleVal, content: finalContent })
      });
      if (!res.ok) throw new Error('Error al guardar página');
      
      const newPage = { slug: slugVal, title: titleVal, content: finalContent };
      setPages(prev => prev.find(p => p.slug === slugVal) ? prev.map(p => p.slug === slugVal ? newPage : p) : [...prev, newPage]);
      setEditingPage(null);
      setSaveSuccess('Página guardada exitosamente.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Error al guardar');
    }
  };

  const handleDeletePage = async (slug: string) => {
    try {
      const res = await fetch(`/api/pages/${slug}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar página');
      setPages(prev => prev.filter(p => p.slug !== slug));
      setPageToDeleteConfirm(null);
      setSaveSuccess('Página eliminada exitosamente.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Error al eliminar página');
    }
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    // cast numbers
    data.price = Number(data.price);
    data.cost = Number(data.cost) || 0;
    data.stock = Number(data.stock);
    if (data.offer_price) {
      data.offer_price = Number(data.offer_price);
    } else {
      data.offer_price = null;
    }

    data.is_featured = formData.get('is_featured') ? 1 : 0;
    data.is_offer = formData.get('is_offer') ? 1 : 0;
    data.is_new = formData.get('is_new') ? 1 : 0;

    try {
      if (data.type === 'variable' && data.variations) {
        data.variations = JSON.parse(data.variations);
      } else {
        data.variations = null;
      }
      if (data.type === 'combo' && data.combo_items) {
        data.combo_items = JSON.parse(data.combo_items);
      } else {
        data.combo_items = null;
      }
    } catch (e) {
      alert("Error en el formato de JSON para variaciones o combo");
      return;
    }

    if (editingProduct) {
      await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...data } : p));
    } else {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      setProducts([...products, { id: result.id, ...data }]);
    }
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh]">
      <h1 className="text-3xl font-bebas mb-6 text-theme-primary">Admin Dashboard</h1>
      
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-theme-card p-6 rounded-lg border border-theme-border flex items-center gap-4 hover:border-theme-border-hover transition">
          <div className="bg-theme-primary/10 p-4 rounded-full text-theme-primary">
            <Package size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Productos</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
        </div>
        <div className="bg-theme-card p-6 rounded-lg border border-theme-border flex items-center gap-4 hover:border-theme-border-hover transition">
          <div className="bg-blue-500/10 p-4 rounded-full text-blue-500">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Órdenes</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
        </div>
        <div className="bg-theme-card p-6 rounded-lg border border-theme-border flex items-center gap-4 hover:border-theme-border-hover transition">
          <div className="bg-green-500/10 p-4 rounded-full text-green-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Usuarios</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
        </div>
        <div className="bg-theme-card p-6 rounded-lg border border-theme-border flex items-center gap-4 hover:border-theme-border-hover transition">
          <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-500">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Ingresos Totales</p>
            <p className="text-xl font-bold">${totalRevenue.toLocaleString('es-CL')}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-theme-border mb-6 overflow-x-auto select-none no-scrollbar">
        {['dashboard', 'products', 'orders', 'users', 'customers', 'newsletter', 'pages', 'settings'].map(tab => (
          <button 
            key={tab}
            onClick={() => {
              if (tab === 'users') {
                 setActiveTab('users');
                 setUserFilter('staff');
              } else if (tab === 'customers') {
                 setActiveTab('users');
                 setUserFilter('customers');
              } else {
                 setActiveTab(tab);
                 if (tab === 'products' || tab === 'orders' || tab === 'settings' || tab === 'dashboard' || tab === 'newsletter' || tab === 'pages') {
                    setUserFilter('all'); // reset or ignore
                 }
              }
            }}
            className={`pb-2 px-4 font-medium transition-colors whitespace-nowrap capitalize ${
              (tab === 'users' && activeTab === 'users' && userFilter === 'staff') ||
              (tab === 'customers' && activeTab === 'users' && userFilter === 'customers') ||
              (tab !== 'users' && tab !== 'customers' && activeTab === tab)
                ? 'border-b-2 border-theme-primary text-theme-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'dashboard' ? 'Resumen' : tab === 'products' ? 'Productos' : tab === 'orders' ? 'Órdenes' : tab === 'users' ? 'Admin. Staff' : tab === 'customers' ? 'Clientes' : tab === 'newsletter' ? 'Suscriptores Boletín' : tab === 'pages' ? 'Páginas (CMS)' : 'Configuración'}
          </button>
        ))}
      </div>

      {/* Dashboard Resumen Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales Chart */}
            <div className="bg-theme-card border border-theme-border rounded-lg p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2"><TrendingUp size={18} className="text-theme-primary" /> Ventas (Últimos 7 días)</h3>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--theme-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--theme-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" tick={{ fill: '#999', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" tick={{ fill: '#999', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--theme-primary)' }}
                      formatter={(value: number) => [`$${value.toLocaleString('es-CL')}`, 'Ventas']}
                    />
                    <Area type="monotone" dataKey="ventas" stroke="var(--theme-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Low stock products */}
            <div className="bg-theme-card border border-theme-border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <AlertTriangle size={18} className="text-yellow-500" />
                Control de Stock
              </h3>
              
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Package size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Todos los productos tienen buen stock.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-theme-base rounded border border-theme-border">
                      <div className="flex items-center gap-3">
                        <img src={getProductImages(p.image)[0] || 'https://images.unsplash.com/photo-1590748152599-2a2ec96a40a4?auto=format&fit=crop&w=150&q=80'} className="w-10 h-10 rounded object-cover" />
                        <div>
                          <p className="text-sm font-medium text-white line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.sku}</p>
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${p.stock === 0 ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                          {p.stock} uni.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-theme-card border border-theme-border rounded-lg">
            <div className="p-4 border-b border-theme-border">
              <h3 className="font-bold text-lg">Órdenes Recientes</h3>
            </div>
            {recentOrders.length === 0 ? (
               <div className="text-center py-8 text-gray-500">Aún no hay órdenes.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="bg-theme-base text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Cliente</th>
                      <th className="px-6 py-3">Fecha</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(o => (
                      <tr key={o.id} className="border-b border-theme-border hover:bg-theme-element/50">
                        <td className="px-6 py-3 text-white font-mono text-xs">#{o.id}</td>
                        <td className="px-6 py-3">
                          <p className="text-white text-sm">{o.customer_name}</p>
                        </td>
                        <td className="px-6 py-3 text-xs">{new Date(o.created_at).toLocaleDateString('es-CL')}</td>
                        <td className="px-6 py-3 font-bold text-white">${o.total.toLocaleString('es-CL')}</td>
                        <td className="px-6 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            o.status === 'delivered' ? 'bg-green-900/40 text-green-400' :
                            o.status === 'paid' ? 'bg-blue-900/40 text-blue-400' :
                            o.status === 'pending' ? 'bg-yellow-900/40 text-yellow-500' :
                            'bg-gray-800 text-gray-400'
                          }`}>
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Table */}
      {activeTab === 'products' && (
        <div className="bg-theme-card border border-theme-border rounded-lg overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-theme-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-white">
              Catálogo <span className="text-sm font-normal text-gray-500 bg-theme-base px-2 py-0.5 rounded-full">{filteredProducts.length}</span>
            </h2>
            <div className="flex gap-4 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Buscar por nombre o SKU..." 
                className="bg-theme-base border border-theme-border text-white text-sm rounded px-3 py-2 outline-none focus:border-theme-primary min-w-[250px]"
                value={productSearch}
                onChange={e => { setProductSearch(e.target.value); setProductPage(1); }}
              />
              <button 
                onClick={() => { setEditingProduct(null); setProductModalOpen(true); }}
                className="bg-theme-primary text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-theme-primary-hover transition"
              >
                <Plus size={16} /> Añadir Producto
              </button>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-theme-base text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Imagen</th>
                  <th className="px-6 py-3">SKU / MPN</th>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Costo</th>
                  <th className="px-6 py-3">Precio</th>
                  <th className="px-6 py-3">Precio Oferta</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No se encontraron productos.</td>
                  </tr>
                ) : (
                  paginatedProducts.map(p => (
                    <tr key={p.id} className="border-b border-theme-border hover:bg-theme-element/50">
                      <td className="px-6 py-4">
                        <img 
                          src={getProductImages(p.image)[0] || 'https://via.placeholder.com/150'} 
                          alt={p.name} 
                          className="w-12 h-12 rounded object-cover border border-theme-border" 
                        />
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        <div>{p.sku}</div>
                        {p.mpn && <div className="text-gray-500 mt-1">{p.mpn}</div>}
                      </td>
                      <td className="px-6 py-4 text-white font-medium">{p.name}</td>
                      <td className="px-6 py-4 text-gray-400">
                        ${(p.cost || 0).toLocaleString('es-CL')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={p.is_offer ? "line-through text-gray-500" : ""}>
                          ${p.price.toLocaleString('es-CL')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-theme-primary font-bold">
                        {p.is_offer && p.offer_price ? `$${p.offer_price.toLocaleString('es-CL')}` : '-'}
                      </td>
                      <td className="px-6 py-4">{p.stock}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-3">
                        <button 
                          onClick={() => { setEditingProduct(p); setProductModalOpen(true); }}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button onClick={() => setProductToDelete(p)} className="text-theme-primary hover:text-red-400 transition">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-theme-border flex justify-between items-center bg-theme-base">
            <span className="text-gray-500 text-sm">Mostrando {paginatedProducts.length} de {filteredProducts.length}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setProductPage(Math.max(1, productPage - 1))}
                disabled={productPage === 1}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Anterior</button>
              <span className="px-3 py-1 text-sm bg-theme-element rounded">{productPage} / {totalProductPages}</span>
              <button 
                onClick={() => setProductPage(Math.min(totalProductPages, productPage + 1))}
                disabled={productPage === totalProductPages}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Siguiente</button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {activeTab === 'orders' && (
        <div className="bg-theme-card border border-theme-border rounded-lg overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-theme-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-white">
              Órdenes <span className="text-sm font-normal text-gray-500 bg-theme-base px-2 py-0.5 rounded-full">{filteredOrders.length}</span>
            </h2>
            <div className="flex gap-4 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Buscar por ID, nombre o email..." 
                className="bg-theme-base border border-theme-border text-white text-sm rounded px-3 py-2 outline-none focus:border-theme-primary min-w-[250px]"
                value={orderSearch}
                onChange={e => { setOrderSearch(e.target.value); setOrderPage(1); }}
              />
              <select 
                className="bg-theme-base border border-theme-border text-white text-sm rounded px-3 py-2 outline-none focus:border-theme-primary"
                value={orderStatusFilter}
                onChange={e => { setOrderStatusFilter(e.target.value); setOrderPage(1); }}
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pago Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-theme-base text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Orden ID</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Dirección</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No hay órdenes para mostrar.</td>
                  </tr>
                ) : (
                  paginatedOrders.map(o => (
                    <tr key={o.id} className="border-b border-theme-border hover:bg-theme-element/50">
                      <td className="px-6 py-4 text-white font-mono">#{o.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-white">{o.customer_name}</p>
                        <p className="text-xs">{o.customer_email}</p>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[200px]" title={o.shipping_address}>{o.shipping_address}</td>
                      <td className="px-6 py-4 font-bold text-white">${o.total.toLocaleString('es-CL')}</td>
                      <td className="px-6 py-4">
                        <select 
                          className={`border border-theme-border text-xs font-bold rounded px-2 py-1 outline-none ${
                            o.status === 'delivered' ? 'bg-green-900/40 text-green-400' :
                            o.status === 'paid' ? 'bg-blue-900/40 text-blue-400' :
                            o.status === 'shipped' ? 'bg-purple-900/40 text-purple-400' :
                            o.status === 'cancelled' || o.status === 'rejected' ? 'bg-red-900/40 text-red-500' :
                            'bg-yellow-900/40 text-yellow-500'
                          }`}
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        >
                          <option className="bg-theme-base text-white" value="pending">Pago Pendiente</option>
                          <option className="bg-theme-base text-white" value="paid">Pago Confirmado (Pagado)</option>
                          <option className="bg-theme-base text-white" value="shipped">Envío en Camino</option>
                          <option className="bg-theme-base text-white" value="delivered">Entregado</option>
                          <option className="bg-theme-base text-white" value="cancelled">Cancelado</option>
                          <option className="bg-theme-base text-white" value="rejected">Pago Rechazado</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-xs">{new Date(o.created_at).toLocaleString('es-CL')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-theme-border flex justify-between items-center bg-theme-base">
            <span className="text-gray-500 text-sm">Mostrando {paginatedOrders.length} de {filteredOrders.length}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setOrderPage(Math.max(1, orderPage - 1))}
                disabled={orderPage === 1}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Anterior</button>
              <span className="px-3 py-1 text-sm bg-theme-element rounded">{orderPage} / {totalOrderPages}</span>
              <button 
                onClick={() => setOrderPage(Math.min(totalOrderPages, orderPage + 1))}
                disabled={orderPage === totalOrderPages}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Siguiente</button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="bg-theme-card border border-theme-border rounded-lg overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-theme-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-white">
              {userFilter === 'customers' ? 'Gestión de Clientes' : 'Gestión de Staff'} <span className="text-sm font-normal text-gray-500 bg-theme-base px-2 py-0.5 rounded-full">{filteredUsers.length}</span>
            </h2>
            <div className="flex gap-4 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Buscar por nombre, email o ID..." 
                className="bg-theme-base border border-theme-border text-white text-sm rounded px-3 py-2 outline-none focus:border-theme-primary min-w-[250px]"
                value={userSearchText}
                onChange={e => { setUserSearchText(e.target.value); setUserPage(1); }}
              />
              <button 
                onClick={() => { setEditingUser(null); setUserModalOpen(true); }}
                className="bg-theme-primary text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-theme-primary-hover transition"
              >
                <Plus size={16} /> Añadir {userFilter === 'customers' ? 'Cliente' : 'Usuario Staff'}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-theme-base text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Teléfono</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3">Registro</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No se encontraron usuarios.</td>
                  </tr>
                ) : (
                  paginatedUsers.map((u: any) => (
                    <tr key={u.id} className="border-b border-theme-border hover:bg-theme-element/50">
                      <td className="px-6 py-4 font-mono text-xs text-white">#{u.id}</td>
                      <td className="px-6 py-4 text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white uppercase">{u.name.charAt(0)}</div>
                          {u.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{u.email}</td>
                      <td className="px-6 py-4 text-gray-300 text-xs">{u.phone || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-red-500/20 text-red-500' : u.role === 'ejecutivo' ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">{new Date(u.created_at).toLocaleDateString('es-CL')}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-3">
                        <button 
                          onClick={() => { setEditingUser(u); setUserModalOpen(true); }}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="text-theme-primary hover:text-red-400 transition">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-theme-border flex justify-between items-center bg-theme-base">
            <span className="text-gray-500 text-sm">Mostrando {paginatedUsers.length} de {filteredUsers.length}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setUserPage(Math.max(1, userPage - 1))}
                disabled={userPage === 1}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Anterior</button>
              <span className="px-3 py-1 text-sm bg-theme-element rounded">{userPage} / {totalUserPages}</span>
              <button 
                onClick={() => setUserPage(Math.min(totalUserPages, userPage + 1))}
                disabled={userPage === totalUserPages}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Siguiente</button>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Panel */}
      {activeTab === 'newsletter' && (
        <div className="bg-theme-card border border-theme-border rounded-lg overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-theme-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-white">
              Suscriptores al Boletín (Mock) <span className="text-sm font-normal text-gray-500 bg-theme-base px-2 py-0.5 rounded-full">{filteredNewsletters.length}</span>
            </h2>
            <div className="flex gap-4 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Buscar por email..." 
                className="bg-theme-base border border-theme-border text-white text-sm rounded px-3 py-2 outline-none focus:border-theme-primary min-w-[250px]"
                value={newsletterSearch}
                onChange={e => { setNewsletterSearch(e.target.value); setNewsletterPage(1); }}
              />
              <button className="bg-theme-primary text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-theme-primary-hover transition">
                Exportar CSV
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-theme-base text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Fecha de Suscripción</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {paginatedNewsletters.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">No se encontraron suscriptores</td>
                  </tr>
                ) : (
                  paginatedNewsletters.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-theme-element transition">
                      <td className="px-6 py-4 font-medium text-white">{sub.email}</td>
                      <td className="px-6 py-4">{sub.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${sub.status === 'Activo' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-theme-border flex justify-between items-center bg-theme-base">
            <span className="text-gray-500 text-sm">Mostrando {paginatedNewsletters.length} de {filteredNewsletters.length}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setNewsletterPage(Math.max(1, newsletterPage - 1))}
                disabled={newsletterPage === 1}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Anterior</button>
              <span className="px-3 py-1 text-sm bg-theme-element rounded">{newsletterPage} / {totalNewsletterPages}</span>
              <button 
                onClick={() => setNewsletterPage(Math.min(totalNewsletterPages, newsletterPage + 1))}
                disabled={newsletterPage === totalNewsletterPages}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Siguiente</button>
            </div>
          </div>
        </div>
      )}

      {/* Pages CMS Panel */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          <div className="bg-theme-card border border-theme-border rounded-lg overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-4 border-b border-theme-border flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="font-bold text-lg flex items-center gap-2 text-white">
                CMS de Páginas <span className="text-sm font-normal text-gray-500 bg-theme-base px-2 py-0.5 rounded-full">
                  {pages.filter(p => 
                    (p.title || '').toLowerCase().includes(pageSearch.toLowerCase()) || 
                    (p.slug || '').toLowerCase().includes(pageSearch.toLowerCase()) ||
                    (p.content || '').toLowerCase().includes(pageSearch.toLowerCase())
                  ).length}
                </span>
              </h2>
              <div className="flex gap-4 w-full sm:w-auto flex-col sm:flex-row">
                <div className="relative flex-1 sm:min-w-[250px]">
                  <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Buscar páginas por título, slug..." 
                    className="w-full bg-theme-base border border-theme-border text-white text-sm rounded pl-9 pr-3 py-2 outline-none focus:border-theme-primary"
                    value={pageSearch}
                    onChange={e => setPageSearch(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setEditingPage({})}
                  className="bg-theme-primary text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-theme-primary-hover transition"
                >
                  <Plus size={16} /> Nueva Página
                </button>
              </div>
            </div>

            {saveSuccess && <div className="m-4 bg-green-500/20 text-green-400 p-3 rounded border border-green-500/30 font-medium text-sm">{saveSuccess}</div>}
            {saveError && <div className="m-4 bg-red-500/20 text-red-400 p-3 rounded border border-red-500/30 font-medium text-sm">{saveError}</div>}

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-theme-base text-xs uppercase text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Título de la Página</th>
                    <th className="px-6 py-3">Ruta del Enlace</th>
                    <th className="px-6 py-3">Tamaño del Contenido</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.filter(p => 
                    (p.title || '').toLowerCase().includes(pageSearch.toLowerCase()) || 
                    (p.slug || '').toLowerCase().includes(pageSearch.toLowerCase()) ||
                    (p.content || '').toLowerCase().includes(pageSearch.toLowerCase())
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        <p className="font-semibold text-base mb-1">No se encontraron páginas.</p>
                        <p className="text-xs">Sugeridas: retornos, faq, envios, terminos, privacidad, quienes-somos, garantia</p>
                      </td>
                    </tr>
                  ) : (
                    pages.filter(p => 
                      (p.title || '').toLowerCase().includes(pageSearch.toLowerCase()) || 
                      (p.slug || '').toLowerCase().includes(pageSearch.toLowerCase()) ||
                      (p.content || '').toLowerCase().includes(pageSearch.toLowerCase())
                    ).map(page => (
                      <tr key={page.slug} className="border-b border-theme-border hover:bg-theme-element/30 font-medium text-gray-300">
                        <td className="px-6 py-4 font-semibold text-white">
                          {page.title}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          <a 
                            href={`/p/${page.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-theme-primary hover:underline flex items-center gap-1 hover:text-white transition"
                          >
                            /p/{page.slug}
                            <Eye size={12} className="opacity-60" />
                          </a>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className="px-2.5 py-1 bg-theme-base border border-theme-border rounded text-gray-400">
                            {(page.content || '').length} caracteres
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-3">
                            {pageToDeleteConfirm === page.slug ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-red-400">¿Eliminar?</span>
                                <button 
                                  onClick={() => handleDeletePage(page.slug)}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition"
                                >
                                  Sí
                                </button>
                                <button 
                                  onClick={() => setPageToDeleteConfirm(null)}
                                  className="bg-theme-element hover:bg-theme-element-hover text-white text-xs px-2 py-1 rounded transition"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => setEditingPage(page)}
                                  className="text-blue-400 hover:text-blue-300 transition flex items-center gap-1 text-xs"
                                  title="Editar Contenido"
                                >
                                  <Edit size={16} />
                                  <span>Editar</span>
                                </button>
                                <button 
                                  onClick={() => setPageToDeleteConfirm(page.slug)}
                                  className="text-theme-primary hover:text-red-400 transition flex items-center gap-1 text-xs"
                                  title="Eliminar Página"
                                >
                                  <Trash2 size={16} />
                                  <span>Eliminar</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {activeTab === 'settings' && (
        <div className="bg-theme-card border border-theme-border rounded-lg p-6 max-w-2xl">
          <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
            <SettingsIcon size={20} className="text-theme-primary" /> Configuración de Plataforma
          </h2>

          {saveSuccess && <div className="mb-4 bg-green-500/20 text-green-400 p-3 rounded border border-green-500/30 font-medium text-sm">{saveSuccess}</div>}
          {saveError && <div className="mb-4 bg-red-500/20 text-red-400 p-3 rounded border border-red-500/30 font-medium text-sm">{saveError}</div>}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* UI Theme Section */}
            <div className="bg-theme-base rounded p-4 border border-theme-border">
              <h3 className="font-bold text-white mb-4">Apariencia (Theme)</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Tema Global (Paleta de Colores)</label>
                  <select 
                    className="w-full bg-theme-card border border-theme-border text-white p-2 text-sm rounded outline-none focus:border-theme-primary"
                    value={settings.theme || theme}
                    onChange={e => {
                      setTheme(e.target.value as any);
                      setSettings({ ...settings, theme: e.target.value });
                    }}
                  >
                    <option value="racing">Racing Base (Negro / Rojo Motor)</option>
                    <option value="corporate">Corporativo (Azul Marino / Azul Vivo)</option>
                    <option value="modern">Moderno Eco (Gris Oscuro / Esmeralda)</option>
                    <option value="enterprise">Empresarial (Púrpura / Violeta)</option>
                    <option value="marketplace">Marketplace (Claro / Amarillo y Rojo)</option>
                    <option value="minimal">Minimalista (Oscuro / Platinado)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-theme-base rounded p-4 border border-theme-border">
              <h3 className="font-bold text-white mb-4">Integración de Pagos (Flow.cl)</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Estado de Pasarela</label>
                  <select 
                    className="w-full bg-theme-card border border-theme-border text-white p-2 text-sm rounded outline-none focus:border-theme-primary"
                    value={settings.payment_method || 'flow'}
                    onChange={e => setSettings({...settings, payment_method: e.target.value})}
                  >
                    <option value="test">Testing (Sandbox)</option>
                    <option value="flow">Flow.cl Producción</option>
                    <option value="transfer">Transferencia Bancaria Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Flow API Key</label>
                  <input 
                    type="password" 
                    placeholder="Ingrese su API KEY de Flow"
                    value={settings.flow_api_key || ''}
                    onChange={e => setSettings({...settings, flow_api_key: e.target.value})}
                    className="w-full bg-theme-card border border-theme-border text-white p-2 text-sm rounded outline-none focus:border-theme-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Flow Secret</label>
                  <input 
                    type="password" 
                    placeholder="Ingrese su Secret de Flow"
                    value={settings.flow_secret || ''}
                    onChange={e => setSettings({...settings, flow_secret: e.target.value})}
                    className="w-full bg-theme-card border border-theme-border text-white p-2 text-sm rounded outline-none focus:border-theme-primary font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Section */}
            <div className="bg-theme-base rounded p-4 border border-theme-border">
              <h3 className="font-bold text-white mb-4">Integración de Envíos (Chilexpress)</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Método por defecto</label>
                  <select 
                    className="w-full bg-theme-card border border-theme-border text-white p-2 text-sm rounded outline-none focus:border-theme-primary"
                    value={settings.shipping_method || 'chilexpress'}
                    onChange={e => setSettings({...settings, shipping_method: e.target.value})}
                  >
                    <option value="chilexpress">Calculadora Chilexpress (API)</option>
                    <option value="flat">Tarifa Plana ($3.990) - Starken / Blue / etc.</option>
                    <option value="free">Envío Gratis MKT</option>
                  </select>
                </div>
                {settings.shipping_method === 'chilexpress' && (
                  <div>
                    <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Chilexpress TCC Key</label>
                    <input 
                      type="password" 
                      placeholder="Subscription Key"
                      value={settings.chx_key || ''}
                      onChange={e => setSettings({...settings, chx_key: e.target.value})}
                      className="w-full bg-theme-card border border-theme-border text-white p-2 text-sm rounded outline-none focus:border-theme-primary font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-theme-primary hover:bg-theme-primary-hover text-white font-bold py-2 px-6 rounded transition-colors flex items-center gap-2"
              >
                <Save size={18} /> Guardar Configuración
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product Create/Edit Modal */}
      {isProductModalOpen && (
        <ProductFormModal 
          products={products}
          editingProduct={editingProduct} 
          onClose={() => setProductModalOpen(false)} 
          onSubmit={handleProductSubmit} 
        />
      )}

      {/* Delete Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-theme-card border border-theme-border rounded-lg w-full max-w-sm p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">¿Eliminar Producto?</h2>
            <p className="text-sm text-gray-400 mb-6">
              Estás a punto de eliminar el producto <span className="text-white font-medium">{productToDelete.name}</span>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setProductToDelete(null)}
                className="flex-1 bg-theme-element text-white py-2 rounded font-bold hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDeleteProduct}
                className="flex-1 bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-theme-card border border-theme-border rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingUser ? 'Editar Usuario' : 'Añadir Usuario'}</h2>
              <button onClick={() => setUserModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
                <input 
                  name="name"
                  type="text" 
                  defaultValue={editingUser?.name}
                  className="w-full bg-theme-base border border-theme-border rounded p-2 text-white outline-none focus:border-theme-primary" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Correo Electrónico</label>
                <input 
                  name="email"
                  type="email" 
                  defaultValue={editingUser?.email}
                  className="w-full bg-theme-base border border-theme-border rounded p-2 text-white outline-none focus:border-theme-primary" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                <input 
                  name="phone"
                  type="tel" 
                  defaultValue={editingUser?.phone}
                  placeholder="+56 9 1234 5678"
                  className="w-full bg-theme-base border border-theme-border rounded p-2 text-white outline-none focus:border-theme-primary" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Fecha de Nacimiento</label>
                <input 
                  name="birthdate"
                  type="date" 
                  defaultValue={editingUser?.birthdate}
                  className="w-full bg-theme-base border border-theme-border rounded p-2 text-white outline-none focus:border-theme-primary" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Dirección Primaria</label>
                <input 
                  name="address"
                  type="text" 
                  defaultValue={editingUser?.address}
                  placeholder="Calle 123, Comuna..."
                  className="w-full bg-theme-base border border-theme-border rounded p-2 text-white outline-none focus:border-theme-primary" 
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Libreta de Direcciones</label>
                <div className="bg-theme-base border border-theme-border rounded p-3 overflow-y-auto max-h-32 text-sm text-gray-300">
                  {(() => {
                    try {
                      if (!editingUser?.addresses) return <p className="text-gray-500">Sin direcciones adicionales</p>;
                      const addrs = JSON.parse(editingUser.addresses);
                      if (!addrs.length) return <p className="text-gray-500">Sin direcciones adicionales</p>;
                      return addrs.map((a: any, i: number) => (
                        <div key={i} className="mb-2 last:mb-0 pb-2 last:pb-0 border-b last:border-0 border-theme-border">
                          <span className="font-bold text-theme-primary">{a.label}:</span> {a.street} {a.number}, {a.commune}, {a.region}
                        </div>
                      ));
                    } catch {
                      return <p className="text-gray-500">Error leyendo direcciones</p>;
                    }
                  })()}
                </div>
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
                  <input 
                    name="password"
                    type="password" 
                    className="w-full bg-theme-base border border-theme-border rounded p-2 text-white outline-none focus:border-theme-primary" 
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rol</label>
                <select 
                  name="role"
                  defaultValue={editingUser?.role || 'customer'}
                  className="w-full bg-theme-base border border-theme-border rounded p-2 text-white outline-none focus:border-theme-primary"
                >
                  <option value="customer">Cliente</option>
                  <option value="ejecutivo">Ejecutivo de Ventas</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="flex-1 bg-theme-element text-white py-2 rounded font-bold hover:bg-gray-700 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-theme-primary text-white py-2 rounded font-bold hover:bg-theme-primary-hover transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Modal */}
      {editingPage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-theme-card border border-theme-border rounded-lg max-w-4xl w-full p-6 shadow-2xl relative my-auto max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-white font-bold">{editingPage.slug ? 'Editar Página' : 'Nueva Página'}</h2>
              <button onClick={() => setEditingPage(null)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSavePage} className="space-y-4 flex-1 flex flex-col min-h-0 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 shrink-0">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Título</label>
                  <input 
                    name="title"
                    type="text" 
                    required
                    defaultValue={editingPage.title}
                    className="w-full bg-theme-base border border-theme-border rounded p-2 text-white outline-none focus:border-theme-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Slug (Ruta /p/slug)</label>
                  <input 
                    name="slug"
                    type="text" 
                    required
                    readOnly={!!editingPage.slug}
                    defaultValue={editingPage.slug}
                    placeholder="ej: envios"
                    className="w-full bg-theme-base border border-theme-border rounded p-2 text-white outline-none focus:border-theme-primary read-only:opacity-50"
                  />
                </div>
              </div>
              
              <div className="flex-1 flex flex-col shrink-0 min-h-[400px]">
                <label className="block text-sm text-gray-400 mb-1">Contenido de la Página</label>
                
                {/* Visual / HTML editor tabs */}
                <div className="flex border-b border-theme-border mb-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (editorTab === 'html') {
                        // Content in editorContent state will be re-injected by useEffect
                        setEditorTab('visual');
                      }
                    }}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition ${editorTab === 'visual' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                  >
                    <Eye size={14} /> Estilo Visual (WYSIWYG)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editorTab === 'visual' && editorRef.current) {
                        setEditorContent(editorRef.current.innerHTML);
                      }
                      setEditorTab('html');
                    }}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition ${editorTab === 'html' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                  >
                    <Code size={14} /> Código Fuente HTML
                  </button>
                </div>

                {/* Toolbar only for Visual tab */}
                {editorTab === 'visual' && (
                  <div className="flex flex-wrap gap-1 p-2 bg-theme-base border border-theme-border border-b-0 rounded-t flex-shrink-0 items-center justify-start">
                    <button
                      type="button"
                      onClick={() => handleFormat('bold')}
                      className="p-1.5 rounded hover:bg-theme-element text-gray-300 hover:text-white transition"
                      title="Negrita"
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormat('italic')}
                      className="p-1.5 rounded hover:bg-theme-element text-gray-300 hover:text-white transition"
                      title="Cursiva"
                    >
                      <Italic size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormat('underline')}
                      className="p-1.5 rounded hover:bg-theme-element text-gray-300 hover:text-white transition"
                      title="Subrayado"
                    >
                      <Underline size={14} />
                    </button>
                    
                    <div className="w-px h-6 bg-theme-border mx-1" />

                    <button
                      type="button"
                      onClick={() => handleFormat('justifyLeft')}
                      className="p-1.5 rounded hover:bg-theme-element text-gray-300 hover:text-white transition"
                      title="Alinear Izquierda"
                    >
                      <AlignLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormat('justifyCenter')}
                      className="p-1.5 rounded hover:bg-theme-element text-gray-300 hover:text-white transition"
                      title="Centrar"
                    >
                      <AlignCenter size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormat('justifyRight')}
                      className="p-1.5 rounded hover:bg-theme-element text-gray-300 hover:text-white transition"
                      title="Alinear Derecha"
                    >
                      <AlignRight size={14} />
                    </button>

                    <div className="w-px h-6 bg-theme-border mx-1" />

                    <button
                      type="button"
                      onClick={() => handleFormat('insertUnorderedList')}
                      className="p-1.5 rounded hover:bg-theme-element text-gray-300 hover:text-white transition"
                      title="Viñetas"
                    >
                      <List size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormat('insertOrderedList')}
                      className="p-1.5 rounded hover:bg-theme-element text-gray-300 hover:text-white transition"
                      title="Numeración"
                    >
                      <ListOrdered size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormat('insertHorizontalRule')}
                      className="p-1.5 rounded hover:bg-theme-element text-gray-300 hover:text-white text-xs font-bold transition px-2"
                      title="Línea Horizontal"
                    >
                      <span className="text-gray-400">LINEA</span>
                    </button>

                    <div className="w-px h-6 bg-theme-border mx-1" />

                    <select
                      onChange={(e) => handleFormat('formatBlock', e.target.value)}
                      defaultValue="p"
                      className="bg-theme-card text-gray-300 border border-theme-border rounded px-2 py-1 text-xs outline-none"
                    >
                      <option value="p">Párrafo (Texto)</option>
                      <option value="h1">Título 1</option>
                      <option value="h2">Título 2</option>
                      <option value="h3">Título 3</option>
                      <option value="h4">Título 4</option>
                      <option value="blockquote">Cita (Bloque)</option>
                    </select>

                    <div className="w-px h-6 bg-theme-border mx-1" />

                    <button
                      type="button"
                      onClick={handleInsertLink}
                      className="p-1.5 rounded hover:bg-theme-element text-gray-300 hover:text-white transition"
                      title="Añadir Enlace"
                    >
                      <LinkIcon size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={handleInsertImageUrl}
                      className="p-1.5 rounded hover:bg-theme-element text-gray-300 hover:text-white transition"
                      title="Añadir Imagen por URL"
                    >
                      <ImageIcon size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editorImageInputRef.current?.click()}
                      className="bg-theme-element hover:bg-theme-primary text-white text-xs px-2.5 py-1.5 rounded transition flex items-center gap-1.5 font-semibold"
                      title="Subir Archivo de Imagen"
                    >
                      <Upload size={12} />
                      <span>Subir PC</span>
                    </button>
                    <input
                      type="file"
                      ref={editorImageInputRef}
                      onChange={handleEditorImageUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="w-px h-6 bg-theme-border mx-1" />

                    <button
                      type="button"
                      onClick={() => handleFormat('removeFormat')}
                      className="text-xs text-gray-500 hover:text-red-400 transition px-1 py-0.5 uppercase tracking-wider font-semibold"
                      title="Limpiar Formato"
                    >
                      Limpiar
                    </button>
                  </div>
                )}

                {/* Editor Area Content */}
                <div className="flex-1 min-h-[350px] flex flex-col">
                  {editorTab === 'visual' ? (
                    <div
                      ref={editorRef}
                      contentEditable
                      className="flex-1 w-full bg-theme-base border border-theme-border rounded-b p-4 text-white outline-none focus:border-theme-primary overflow-y-auto wysiwyg-editor-content text-base leading-relaxed"
                      style={{ minHeight: '350px' }}
                    />
                  ) : (
                    <textarea
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      className="w-full flex-1 bg-theme-base border border-theme-border rounded p-4 text-white outline-none focus:border-theme-primary font-mono text-sm resize-none"
                      style={{ minHeight: '350px' }}
                      placeholder="<!-- Escribe tu código HTML aquí -->"
                    />
                  )}
                </div>

                <style>{`
                  .wysiwyg-editor-content h1 { font-size: 2.25rem; font-weight: bold; margin-bottom: 0.5em; color: white; }
                  .wysiwyg-editor-content h2 { font-size: 1.75rem; font-weight: bold; margin-bottom: 0.5em; color: white; margin-top: 1em; }
                  .wysiwyg-editor-content h3 { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5em; color: white; margin-top: 1em; }
                  .wysiwyg-editor-content h4 { font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5em; color: white; margin-top: 1em; }
                  .wysiwyg-editor-content p { margin-bottom: 1em; line-height: 1.6; color: #d1d5db; }
                  .wysiwyg-editor-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                  .wysiwyg-editor-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
                  .wysiwyg-editor-content blockquote { border-left: 4px solid var(--theme-primary); padding-left: 1rem; margin-bottom: 1rem; color: #9ca3af; font-style: italic; }
                  .wysiwyg-editor-content img { max-width: 100%; height: auto; border-radius: 6px; margin: 1em 0; display: block; border: 1px solid var(--theme-border); }
                  .wysiwyg-editor-content a { color: var(--theme-primary); text-decoration: underline; }
                  .wysiwyg-editor-content strong { color: white; font-weight: bold; }
                `}</style>
              </div>

              <div className="pt-4 flex gap-4 shrink-0">
                <button 
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="flex-1 bg-theme-element text-white py-2 rounded font-bold hover:bg-gray-700 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-theme-primary text-white py-2 rounded font-bold hover:bg-theme-primary-hover transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
