import React, { useState, useRef } from 'react';
import {
  Building,
  MapPin,
  Phone,
  Radio,
  Users,
  Plus,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import type { Venue } from '../../types';

export interface AddVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVenue: (venue: Venue) => void;
  onShowToast?: (message: string) => void;
}

export const AddVenueModal: React.FC<AddVenueModalProps> = ({
  isOpen,
  onClose,
  onAddVenue,
  onShowToast
}) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [capacity, setCapacity] = useState<number | string>(30000);
  const [address, setAddress] = useState('');
  const [soundSystem, setSoundSystem] = useState('L-Acoustics K1 Stadium Array');
  const [type, setType] = useState<Venue['type']>('Stadium');
  const [contactPerson, setContactPerson] = useState('');
  const [image, setImage] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const validateField = (fieldName: string, value: string | number) => {
    let error = '';

    switch (fieldName) {
      case 'name':
        if (!String(value).trim()) {
          error = 'Arena / Stadium title is required';
        } else if (String(value).trim().length < 3) {
          error = 'Venue name must be at least 3 characters long';
        } else if (String(value).trim().length > 100) {
          error = 'Venue name cannot exceed 100 characters';
        }
        break;

      case 'city':
        if (!String(value).trim()) {
          error = 'City is required';
        } else if (String(value).trim().length < 2) {
          error = 'City must be at least 2 characters long';
        }
        break;

      case 'address':
        if (!String(value).trim()) {
          error = 'Full physical address is required';
        } else if (String(value).trim().length < 5) {
          error = 'Please enter a complete address (minimum 5 characters)';
        }
        break;

      case 'capacity':
        const numCapacity = Number(value);
        if (!value && value !== 0) {
          error = 'Audience capacity is required';
        } else if (isNaN(numCapacity) || numCapacity < 100) {
          error = 'Audience capacity must be at least 100 seats';
        } else if (numCapacity > 300000) {
          error = 'Audience capacity cannot exceed 300,000 seats';
        }
        break;

      case 'contactPerson':
        const phoneDigits = String(value).replace(/\D/g, '');
        if (!phoneDigits) {
          error = '10-digit phone number is required';
        } else if (phoneDigits.length !== 10) {
          error = `Please enter exactly 10 digits (${phoneDigits.length}/10 entered)`;
        }
        break;

      case 'soundSystem':
        if (!String(value).trim()) {
          error = 'Audio / sound system rig specification is required';
        } else if (String(value).trim().length < 3) {
          error = 'Audio system description must be at least 3 characters';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleBlur = (fieldName: string, value: string | number) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    } else {
      clearFieldError(fieldName);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast?.('Please upload a valid image file (PNG, JPG, WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onShowToast?.('Image size should be less than 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setImage('');
    setImageFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setName('');
    setCity('');
    setCapacity(30000);
    setAddress('');
    setContactPerson('');
    setSoundSystem('L-Acoustics K1 Stadium Array');
    setType('Stadium');
    handleRemoveImage();
    setErrors({});
    setTouched({});
    setHasSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    // Mark all as touched
    setTouched({
      name: true,
      city: true,
      address: true,
      capacity: true,
      contactPerson: true,
      soundSystem: true
    });

    const formErrors: Record<string, string> = {
      ...(validateField('name', name) ? { name: validateField('name', name) } : {}),
      ...(validateField('city', city) ? { city: validateField('city', city) } : {}),
      ...(validateField('address', address) ? { address: validateField('address', address) } : {}),
      ...(validateField('capacity', capacity) ? { capacity: validateField('capacity', capacity) } : {}),
      ...(validateField('contactPerson', contactPerson) ? { contactPerson: validateField('contactPerson', contactPerson) } : {}),
      ...(validateField('soundSystem', soundSystem) ? { soundSystem: validateField('soundSystem', soundSystem) } : {})
    };

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      onShowToast?.(`Please resolve the ${Object.keys(formErrors).length} highlighted issues.`);
      return;
    }

    const newVenue: Venue = {
      id: `ven-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      city: city.trim(),
      capacity: Number(capacity) || 10000,
      address: address.trim(),
      soundSystem: soundSystem.trim() || 'L-Acoustics Stadium Rig',
      type,
      contactPerson: contactPerson.trim() || 'Venue Operations Desk',
      status: 'active',
      image: image || undefined
    };

    onAddVenue(newVenue);
    resetForm();

    if (onShowToast) {
      onShowToast(`Partner venue "${newVenue.name}" registered successfully!`);
    }

    onClose();
  };

  const getInputClassName = (fieldName: string) => {
    const hasError = touched[fieldName] && errors[fieldName];
    return `w-full h-10 rounded-md border text-xs text-slate-800 transition-all ${hasError
      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-100'
      : 'border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
      } shadow-2xs`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Add Partner Concert Arena / Stadium"
      subtitle="Register stage specifications, audio delay rigs, and security turnstiles"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
        {/* Above Form: Global Validation Error Summary Banner */}
        {/* {hasSubmitted && Object.keys(errors).length > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-rose-800 flex items-start gap-3 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="h-8 w-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-rose-900">
                Form Validation Issues ({Object.keys(errors).length} to resolve)
              </h4>
              <p className="text-[11px] text-rose-700">
                Please check the following issues highlighted above and below each field:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700 font-medium pt-0.5">
                {Object.values(errors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )} */}



        {/* Arena / Stadium Name */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Arena / Stadium Name</span>
              <span className="text-rose-500 font-bold">*</span>
            </span>
            {touched.name && errors.name ? (
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 animate-in fade-in">
                <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
                <span>Issue: {errors.name}</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-normal">Official venue title</span>
            )}
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearFieldError('name');
              }}
              onBlur={() => handleBlur('name', name)}
              placeholder="e.g. DY Patil Stadium"
              className={`${getInputClassName('name')} pl-9 pr-3.5`}
            />
          </div>
          {touched.name && errors.name && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200/90 px-2.5 py-1.5 rounded-md mt-1 animate-in fade-in duration-150">
              <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span>{errors.name}</span>
            </div>
          )}
        </div>

        {/* City & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-purple-600" />
                <span>City <span className="text-rose-500">*</span></span>
              </span>
              {touched.city && errors.city && (
                <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
                  <span>Issue: Required</span>
                </span>
              )}
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                clearFieldError('city');
              }}
              onBlur={() => handleBlur('city', city)}
              placeholder="e.g. Navi Mumbai"
              className={`${getInputClassName('city')} px-3.5`}
            />
            {touched.city && errors.city && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200/90 px-2.5 py-1.5 rounded-md mt-1 animate-in fade-in duration-150">
                <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                <span>{errors.city}</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Arena Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Venue['type'])}
              className="w-full h-10 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all cursor-pointer"
            >
              <option value="Stadium">Stadium</option>
              <option value="Arena">Arena</option>
              <option value="Open Grounds">Open Grounds</option>
              <option value="Auditorium">Auditorium</option>
              <option value="Club">Club / Amphitheatre</option>
            </select>
          </div>
        </div>

        {/* Max Capacity & Contact Person */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-purple-600" />
                <span>Max Capacity <span className="text-rose-500">*</span></span>
              </span>
              {touched.capacity && errors.capacity && (
                <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
                  <span>Issue: Bounds</span>
                </span>
              )}
            </label>
            <input
              type="number"
              min="100"
              max="300000"
              value={capacity}
              onChange={(e) => {
                setCapacity(e.target.value === '' ? '' : Number(e.target.value));
                clearFieldError('capacity');
              }}
              onBlur={() => handleBlur('capacity', capacity)}
              placeholder="e.g. 35000"
              className={`${getInputClassName('capacity')} px-3.5 font-semibold`}
            />
            {touched.capacity && errors.capacity && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200/90 px-2.5 py-1.5 rounded-md mt-1 animate-in fade-in duration-150">
                <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                <span>{errors.capacity}</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-purple-600" />
                <span>Contact Phone Number <span className="text-rose-500">*</span></span>
              </span>
              {touched.contactPerson && errors.contactPerson ? (
                <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
                  <span>Issue: 10 Digits</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-normal">10 digits only</span>
              )}
            </label>
            <div className="relative">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={contactPerson}
                onChange={(e) => {
                  const numbersOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setContactPerson(numbersOnly);
                  clearFieldError('contactPerson');
                }}
                onBlur={() => handleBlur('contactPerson', contactPerson)}
                placeholder="e.g. 9825011920"
                className={`${getInputClassName('contactPerson')} px-3.5 tracking-wider font-medium`}
              />
              {contactPerson && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 pointer-events-none">
                  {contactPerson.length}/10
                </span>
              )}
            </div>
            {touched.contactPerson && errors.contactPerson && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200/90 px-2.5 py-1.5 rounded-md mt-1 animate-in fade-in duration-150">
                <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                <span>{errors.contactPerson}</span>
              </div>
            )}
          </div>
        </div>

        {/* Full Address */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Full Address</span>
              <span className="text-rose-500 font-bold">*</span>
            </span>
            {touched.address && errors.address ? (
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 animate-in fade-in">
                <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
                <span>Issue: {errors.address}</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-normal">Sector, Landmark, Pin code...</span>
            )}
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              clearFieldError('address');
            }}
            onBlur={() => handleBlur('address', address)}
            placeholder="Sector, Landmark, Pin code..."
            className={`${getInputClassName('address')} px-3.5`}
          />
          {touched.address && errors.address && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200/90 px-2.5 py-1.5 rounded-md mt-1 animate-in fade-in duration-150">
              <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span>{errors.address}</span>
            </div>
          )}
        </div>

        {/* Audio / Sound System */}
        {/* <div className="space-y-1">
          <label className="font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-purple-600" />
              <span>Audio / Sound System Rig <span className="text-rose-500">*</span></span>
            </span>
            {touched.soundSystem && errors.soundSystem && (
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 animate-in fade-in">
                <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
                <span>Issue: Required</span>
              </span>
            )}
          </label>
          <input
            type="text"
            value={soundSystem}
            onChange={(e) => {
              setSoundSystem(e.target.value);
              clearFieldError('soundSystem');
            }}
            onBlur={() => handleBlur('soundSystem', soundSystem)}
            placeholder="e.g. L-Acoustics K1 / d&b audiotechnik"
            className={`${getInputClassName('soundSystem')} px-3.5`}
          />
          {touched.soundSystem && errors.soundSystem && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200/90 px-2.5 py-1.5 rounded-md mt-1 animate-in fade-in duration-150">
              <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span>{errors.soundSystem}</span>
            </div>
          )}
        </div> */}

        {/* Arena / Stage Image Upload Section */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-purple-600" />
              <span>Arena / Stage Photo</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">Optional (PNG, JPG up to 10MB)</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!image ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragging
                ? 'border-purple-500 bg-purple-50/50 scale-[0.99]'
                : 'border-slate-200 hover:border-purple-300 bg-slate-50/60 hover:bg-purple-50/20'
                }`}
            >
              <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2 shadow-2xs">
                <Upload className="h-5 w-5 stroke-[2.2]" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Click to upload arena photo <span className="text-slate-400 font-normal">or drag & drop</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload stadium grandstand or concert stage photography directly from your device
              </p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-2xs">
              <img
                src={image}
                alt="Venue preview"
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-purple-600" />
                  <span>Change Photo</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-slate-900/75 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5">
                <ImageIcon className="h-3 w-3 text-purple-300" />
                <span className="truncate max-w-[200px]">{imageFileName || 'Arena Photo Uploaded'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-md text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-sm shadow-purple-200 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Save Arena</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
