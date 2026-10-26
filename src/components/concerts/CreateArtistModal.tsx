import React, { useState, useRef } from 'react';
import {
  Upload,
  Mic2,
  Globe,
  Radio,
  FileText,
  Phone,
  Mail,
  Headphones,
  Building,
  User,
  Plus
} from 'lucide-react';
import { Modal } from '../common/Modal';
import type { Artist } from '../../types';

interface CreateArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddArtist: (artist: Omit<Artist, 'id'>) => void;
  onShowToast?: (message: string) => void;
}

const PRESET_AVATARS = [
  { label: 'EDM / DJ', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80' },
  { label: 'Vocalist Stage', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80' },
  { label: 'Rock Band Crowd', url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80' },
  { label: 'Pop Star Neon', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80' },
  { label: 'Festival Producer', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80' },
  { label: 'Acoustic Guitarist', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80' }
];

const PRESET_BANNERS = [
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80'
];

export const CreateArtistModal: React.FC<CreateArtistModalProps> = ({
  isOpen,
  onClose,
  onAddArtist,
  onShowToast
}) => {
  // Form state
  const [name, setName] = useState('');
  const [stageName, setStageName] = useState('');
  const [genre, setGenre] = useState('EDM');
  const [customGenre, setCustomGenre] = useState('');
  const [subGenresInput, setSubGenresInput] = useState('Melodic Techno, Progressive, Live Electronic');
  const [country, setCountry] = useState('India');
  const [city, setCity] = useState('Mumbai');
  const [monthlyListeners, setMonthlyListeners] = useState('12.5M');
  const [status, setStatus] = useState<Artist['status']>('touring');
  const [bio, setBio] = useState('');

  // Media
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0].url);
  const [bannerImage] = useState(PRESET_BANNERS[0]);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Social & Streaming
  const [spotify, setSpotify] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');

  // Management & Agency
  const [managerName, setManagerName] = useState('');
  const [agency, setAgency] = useState('Wasserman Music / Live Nation');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Technical & Hospitality Rider
  const [micPreference, setMicPreference] = useState('Shure Axient Digital KSM9 / Neumann KMS 105');
  const [inEarMonitors, setInEarMonitors] = useState('JH Audio Roxanne / Sennheiser 2000 Series');
  const [hospitalityNotes, setHospitalityNotes] = useState('Organic vegan catering, fresh ginger-lemon tea, quiet greenroom');
  const [stagePlotNotes, setStagePlotNotes] = useState('Center stage riser for keyboard & electronics, 4 wedge monitors');

  // Active form section tab
  const [activeTab, setActiveTab] = useState<'profile' | 'management' | 'rider'>('profile');

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalGenre = genre === 'Other' && customGenre.trim() ? customGenre.trim() : genre;
    const subGenres = subGenresInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const newArtistData: Omit<Artist, 'id'> = {
      name: name.trim(),
      stageName: stageName.trim() || undefined,
      genre: finalGenre,
      subGenres: subGenres.length > 0 ? subGenres : [finalGenre],
      bio: bio.trim() || `${name.trim()} is an acclaimed touring headline music act performing across major partner concert arenas.`,
      avatar,
      bannerImage,
      country: country.trim() || 'India',
      city: city.trim() || 'Mumbai',
      monthlyListeners: monthlyListeners.trim() || '5.0M',
      status,
      verified: true,
      totalConcerts: 0,
      upcomingConcerts: 1,
      socialLinks: {
        spotify: spotify.trim() || `https://open.spotify.com/search/${encodeURIComponent(name.trim())}`,
        instagram: instagram.trim() || undefined,
        youtube: youtube.trim() || undefined
      },
      management: {
        managerName: managerName.trim() || 'Operations & Tour Management',
        agency: agency.trim() || 'Direct Talent Representation',
        email: email.trim() || 'talent@zenithentertainment.in',
        phone: phone.trim() || '+91 98450 00000'
      },
      rider: {
        microphonePreference: micPreference.trim(),
        inEarMonitors: inEarMonitors.trim(),
        hospitalityNotes: hospitalityNotes.trim(),
        stagePlotNotes: stagePlotNotes.trim()
      }
    };

    onAddArtist(newArtistData);

    if (onShowToast) {
      onShowToast(`Artist "${newArtistData.name}" created and added to roster!`);
    }

    // Reset fields
    setName('');
    setStageName('');
    setBio('');
    setSpotify('');
    setInstagram('');
    setYoutube('');
    setManagerName('');
    setEmail('');
    setPhone('');
    setActiveTab('profile');

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register & Create Touring Artist"
      subtitle="Register headliners, Spotify streaming profiles, booking managers, and technical riders"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Navigation Section Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile & Press Kit</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('management')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
              activeTab === 'management'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="h-3.5 w-3.5" />
            <span>Agency & Streaming</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rider')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
              activeTab === 'rider'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic2 className="h-3.5 w-3.5" />
            <span>Stage Rider & Acoustics</span>
          </button>
        </div>

        {/* Tab 1: Profile & Artwork */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Artist / Band Name */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>
                    Artist / Band Name <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Official billing title</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diljit Dosanjh, Anyma, Arijit Singh"
                  className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
                />
              </div>

              {/* Stage Alias / Full Legal */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Stage Alias / Live Production Name</label>
                <input
                  type="text"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  placeholder="e.g. Dil-Luminati Global Run / Solo Acoustic"
                  className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
                />
              </div>
            </div>

            {/* Genre & Subgenres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Primary Musical Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all cursor-pointer"
                >
                  <option value="EDM">EDM / Electronic / Techno</option>
                  <option value="Bollywood">Bollywood / Playback Orchestral</option>
                  <option value="Rock">Rock / Stadium Anthems</option>
                  <option value="Punjabi">Punjabi Wave / Folk Fusion</option>
                  <option value="Pop">Pop / Global Chart-topper</option>
                  <option value="Hip-Hop">Hip-Hop / Rap / Urban</option>
                  <option value="Indie">Indie / Acoustic / Folk</option>
                  <option value="Classical">Classical & Symphony</option>
                  <option value="Other">Custom Genre...</option>
                </select>
                {genre === 'Other' && (
                  <input
                    type="text"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    placeholder="Enter custom genre"
                    className="w-full mt-1.5 h-8.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Sub-Genres & Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={subGenresInput}
                  onChange={(e) => setSubGenresInput(e.target.value)}
                  placeholder="e.g. Melodic Techno, Ambient, Synthwave"
                  className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
                />
              </div>
            </div>

            {/* Origin & Tour Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Origin Territory / City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai, London, Chandigarh"
                  className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Home Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. India, United Kingdom, USA"
                  className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Touring Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Artist['status'])}
                  className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all cursor-pointer"
                >
                  <option value="touring">Active On World Tour</option>
                  <option value="active">Active Touring Roster</option>
                  <option value="available">Booking Available / Ready</option>
                  <option value="on-break">On Hiatus / Studio Break</option>
                </select>
              </div>
            </div>

            {/* Artist Profile Photo / Avatar */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="font-semibold text-slate-700 flex items-center justify-between">
                <span>Artist Press Headshot / Avatar</span>
                <span className="text-[11px] text-slate-400 font-normal">Choose preset or upload custom</span>
              </label>

              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                  <img src={avatar} alt="Avatar Preview" className="h-full w-full object-cover" />
                </div>

                <div className="flex-1 space-y-1.5">
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://... image URL"
                    className="w-full h-8.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      <Upload className="h-3 w-3" />
                      <span>Upload Local Photo</span>
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                    <span className="text-[10px] text-slate-400">JPG, PNG or WebP</span>
                  </div>
                </div>
              </div>

              {/* Preset Avatars */}
              <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5">
                {PRESET_AVATARS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(p.url)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-all cursor-pointer shrink-0 ${
                      avatar === p.url
                        ? 'bg-purple-50 text-purple-700 border-purple-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="h-3.5 w-3.5 rounded-full object-cover" />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Artist Bio */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Artist Biography & Tour Pitch</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Highlight musical background, awards, notable festival appearances, and live stage aura..."
                className="w-full rounded-md border border-slate-200 bg-slate-50/60 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all resize-none"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Management & Streaming */}
        {activeTab === 'management' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-purple-600" />
                  <span>Lead Artist Manager / Representative</span>
                </label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="e.g. Scooter Braun, Phil Harvey, Sonali Singh"
                  className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-purple-600" />
                  <span>Booking Agency / Management House</span>
                </label>
                <input
                  type="text"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  placeholder="e.g. WME Global, CAA, TM Talent, OML"
                  className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-purple-600" />
                  <span>Direct Booking Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. booking@artistmanagement.com"
                  className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-purple-600" />
                  <span>Tour Manager Phone / Desk</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98450 82910"
                  className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
                />
              </div>
            </div>

            {/* Monthly Listeners & Spotify */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Headphones className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Global Monthly Listeners (Spotify / Apple)</span>
                </label>
                <input
                  type="text"
                  value={monthlyListeners}
                  onChange={(e) => setMonthlyListeners(e.target.value)}
                  placeholder="e.g. 24.5M"
                  className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Spotify Artist Profile Link</span>
                </label>
                <input
                  type="url"
                  value={spotify}
                  onChange={(e) => setSpotify(e.target.value)}
                  placeholder="https://open.spotify.com/artist/..."
                  className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
                />
              </div>
            </div>

            {/* Instagram & YouTube */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Official Instagram Profile</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="e.g. https://instagram.com/artist or @handle"
                  className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Official YouTube / VEVO Channel</label>
                <input
                  type="url"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/@artist"
                  className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Stage Rider & Acoustics */}
        {activeTab === 'rider' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Mic2 className="h-3.5 w-3.5 text-purple-600" />
                <span>Vocal & Instrument Microphone Preference</span>
              </label>
              <input
                type="text"
                value={micPreference}
                onChange={(e) => setMicPreference(e.target.value)}
                placeholder="e.g. Shure Axient Digital Dual KSM9 Handhelds, Neumann KMS 105"
                className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Headphones className="h-3.5 w-3.5 text-purple-600" />
                <span>In-Ear Monitoring (IEM) & Wireless Frequencies</span>
              </label>
              <input
                type="text"
                value={inEarMonitors}
                onChange={(e) => setInEarMonitors(e.target.value)}
                placeholder="e.g. Sennheiser 2000 IEM Wireless + JH Audio Roxanne Custom Fit"
                className="w-full h-9.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-purple-600" />
                <span>Hospitality & Dressing Room Catering Rider</span>
              </label>
              <textarea
                rows={2}
                value={hospitalityNotes}
                onChange={(e) => setHospitalityNotes(e.target.value)}
                placeholder="Beverages, organic vegan/vegetarian catering, quiet greenroom acoustics, steam inhaler..."
                className="w-full rounded-md border border-slate-200 bg-slate-50/60 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-purple-600" />
                <span>Stage Plot, Floor Wedge & Riser Specifications</span>
              </label>
              <textarea
                rows={2}
                value={stagePlotNotes}
                onChange={(e) => setStagePlotNotes(e.target.value)}
                placeholder="Center drum riser 8x8 ft, synth stand, thrust runway dimensions, pyrotechnic cues..."
                className="w-full rounded-md border border-slate-200 bg-slate-50/60 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all resize-none"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {activeTab !== 'profile' && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'rider' ? 'management' : 'profile')}
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                Previous Step
              </button>
            )}
            {activeTab !== 'rider' && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'profile' ? 'management' : 'rider')}
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
              >
                Next Step
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-sm shadow-purple-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Register Artist</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
