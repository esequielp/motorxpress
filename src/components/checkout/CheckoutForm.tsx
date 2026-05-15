import { useState, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { validateRut, formatRut } from '../../lib/utils/formatRut';
import { useCart } from '../../store/cart';
import { formatCLP } from '../../lib/utils/formatCLP';

const shippingSchema = z.object({
  firstName:  z.string().min(2, "El nombre es muy corto"),
  lastName:   z.string().min(2, "El apellido es muy corto"),
  email:      z.string().email("Correo inválido"),
  phone:      z.string().regex(/^(\+56)?[0-9]{9}$/, "Formato: +56912345678 o 912345678"),
  rut:        z.string().refine(validateRut, "RUT inválido"),
  street:     z.string().min(5, "Dirección muy corta"),
  number:     z.string().min(1, "Requerido"),
  apartment:  z.string().optional(),
  commune:    z.string().min(2, "Requerido"),
  region:     z.string().min(2, "Requerido"),
});

type ShippingForm = z.infer<typeof shippingSchema>;

export default function CheckoutForm({ onComplete }: { onComplete: (data: ShippingForm) => void }) {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema)
  });

  const onSubmit = (data: ShippingForm) => {
    onComplete(data);
  };

  const handleRutChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue('rut', formatRut(e.target.value), { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-theme-card p-6 rounded-lg border border-theme-border">
      <h2 className="text-xl font-bold text-white mb-4">1. Datos de envío</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nombre</label>
          <input {...register('firstName')} className="w-full bg-theme-base border border-theme-border rounded p-2 text-white" />
          {errors.firstName && <span className="text-red-500 text-xs">{errors.firstName.message}</span>}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Apellido</label>
          <input {...register('lastName')} className="w-full bg-theme-base border border-theme-border rounded p-2 text-white" />
          {errors.lastName && <span className="text-red-500 text-xs">{errors.lastName.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input type="email" {...register('email')} className="w-full bg-theme-base border border-theme-border rounded p-2 text-white" />
          {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
          <input {...register('phone')} placeholder="912345678" className="w-full bg-theme-base border border-theme-border rounded p-2 text-white" />
          {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">RUT</label>
        <input 
          {...register('rut')} 
          onChange={handleRutChange}
          placeholder="12.345.678-9" 
          className="w-full bg-theme-base border border-theme-border rounded p-2 text-white" 
        />
        {errors.rut && <span className="text-red-500 text-xs">{errors.rut.message}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-400 mb-1">Calle</label>
          <input {...register('street')} className="w-full bg-theme-base border border-theme-border rounded p-2 text-white" />
          {errors.street && <span className="text-red-500 text-xs">{errors.street.message}</span>}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Número</label>
          <input {...register('number')} className="w-full bg-theme-base border border-theme-border rounded p-2 text-white" />
          {errors.number && <span className="text-red-500 text-xs">{errors.number.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Depto/Casa</label>
          <input {...register('apartment')} className="w-full bg-theme-base border border-theme-border rounded p-2 text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Comuna</label>
          <input {...register('commune')} className="w-full bg-theme-base border border-theme-border rounded p-2 text-white" />
          {errors.commune && <span className="text-red-500 text-xs">{errors.commune.message}</span>}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Región</label>
          <input {...register('region')} className="w-full bg-theme-base border border-theme-border rounded p-2 text-white" />
          {errors.region && <span className="text-red-500 text-xs">{errors.region.message}</span>}
        </div>
      </div>

      <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded hover:bg-gray-200 transition-colors">
        Continuar a Opciones de Envío
      </button>
    </form>
  );
}
