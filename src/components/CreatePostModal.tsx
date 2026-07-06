import React, { useState, useRef } from 'react';
import { X, Image, Video, Mic, Smile, Sliders, AlertCircle } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { StickerPicker } from './StickerPicker';
import { PHOTO_FILTERS } from '../types';

interface CreatePostModalProps {
  onClose: () => void;
  onSubmit: (postData: {
    type: 'photo' | 'video' | 'voice' | 'text';
    content: string;
    mediaBase64?: string;
    voiceBase64?: string;
    sticker?: string;
    filter?: string;
  }) => Promise<void>;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onSubmit }) => {
  const [postType, setPostType] = useState<'photo' | 'video' | 'voice' | 'text'>('text');
  const [content, setContent] = useState('');
  const [mediaBase64, setMediaBase64] = useState<string | undefined>(undefined);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [voiceBase64, setVoiceBase64] = useState<string | undefined>(undefined);
  const [selectedSticker, setSelectedSticker] = useState<string | undefined>(undefined);
  const [selectedFilter, setSelectedFilter] = useState('');
  
  const [showStickers, setShowStickers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File picker handler (photo/video)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size limit check (e.g. 15MB for fast base64 post)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File is too large. Please select a file smaller than 15MB.');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setMediaBase64(base64String);
      setMediaPreview(base64String);
    };
  };

  const triggerFileSelect = (type: 'photo' | 'video') => {
    setPostType(type);
    setErrorMsg(null);
    setMediaBase64(undefined);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'photo' ? 'image/*' : 'video/*';
      fileInputRef.current.click();
    }
  };

  const handleVoiceComplete = (base64Audio: string) => {
    setVoiceBase64(base64Audio);
    setPostType('voice');
  };

  const handleSelectSticker = (emoji: string) => {
    setSelectedSticker(emoji);
    setShowStickers(false);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postType === 'text' && !content.trim() && !selectedSticker) {
      setErrorMsg('Please write something or add a sticker to post!');
      return;
    }
    if ((postType === 'photo' || postType === 'video') && !mediaBase64) {
      setErrorMsg(`Please select a ${postType} to upload!`);
      return;
    }
    if (postType === 'voice' && !voiceBase64) {
      setErrorMsg('Please record a voice note first!');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSubmit({
        type: postType,
        content: content.trim(),
        mediaBase64,
        voiceBase64,
        sticker: selectedSticker,
        filter: postType === 'photo' ? selectedFilter : undefined
      });
      onClose();
    } catch (err: any) {
      console.error('Submit post failed:', err);
      setErrorMsg(err.message || 'Failed to submit post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-brand-slate border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-display text-lg font-bold text-brand-sand">Create Close Friends Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handlePostSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-900/30 text-red-300 border border-red-500/20 p-3 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Post Type Selector Tabs */}
          <div className="grid grid-cols-4 gap-2 bg-brand-charcoal p-1 rounded-xl border border-gray-800">
            <button
              type="button"
              onClick={() => { setPostType('text'); setMediaPreview(null); setMediaBase64(undefined); }}
              className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-all ${
                postType === 'text' ? 'bg-brand-gold text-brand-charcoal' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smile className="w-4 h-4" />
              <span>Text</span>
            </button>
            <button
              type="button"
              onClick={() => triggerFileSelect('photo')}
              className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-all ${
                postType === 'photo' ? 'bg-brand-gold text-brand-charcoal' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Photo</span>
            </button>
            <button
              type="button"
              onClick={() => triggerFileSelect('video')}
              className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-all ${
                postType === 'video' ? 'bg-brand-gold text-brand-charcoal' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video</span>
            </button>
            <button
              type="button"
              onClick={() => { setPostType('voice'); setMediaPreview(null); setMediaBase64(undefined); }}
              className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-all ${
                postType === 'voice' ? 'bg-brand-gold text-brand-charcoal' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Voice</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Media Previews / Recorders depending on selected type */}
          {postType === 'photo' && mediaPreview && (
            <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-brand-charcoal flex items-center justify-center h-64 group">
              <img
                src={mediaPreview}
                alt="Upload preview"
                className={`max-h-full max-w-full object-contain ${selectedFilter}`}
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => { setMediaPreview(null); setMediaBase64(undefined); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="absolute bottom-2 left-2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-gold text-brand-charcoal font-semibold text-xs shadow-md"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>
          )}

          {postType === 'video' && mediaPreview && (
            <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-brand-charcoal flex items-center justify-center h-64">
              <video
                src={mediaPreview}
                controls
                className="max-h-full max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() => { setMediaPreview(null); setMediaBase64(undefined); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {postType === 'voice' && (
            <div className="py-2">
              {voiceBase64 ? (
                <div className="flex items-center justify-between bg-brand-charcoal border border-brand-gold/20 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Mic className="text-brand-gold w-5 h-5 animate-pulse" />
                    <span className="text-sm font-semibold text-brand-sand">Voice recording attached!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVoiceBase64(undefined)}
                    className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <VoiceRecorder
                  onRecordingComplete={handleVoiceComplete}
                  onCancel={() => setPostType('text')}
                />
              )}
            </div>
          )}

          {/* Filter Customization Panel (only for Photo) */}
          {postType === 'photo' && mediaPreview && showFilters && (
            <div className="bg-brand-charcoal border border-gray-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-semibold text-brand-sand">Select Arabian & Instagram Filters:</span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {PHOTO_FILTERS.map((filter) => (
                  <button
                    key={filter.name}
                    type="button"
                    onClick={() => setSelectedFilter(filter.class)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-1.5 rounded-lg border ${
                      selectedFilter === filter.class ? 'border-brand-gold bg-brand-slate' : 'border-transparent hover:bg-brand-slate/50'
                    }`}
                  >
                    <div className="w-14 h-14 rounded overflow-hidden relative">
                      <img
                        src={mediaPreview}
                        alt="filter preview"
                        className={`w-full h-full object-cover ${filter.class}`}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 truncate max-w-[65px]">{filter.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Caption Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Caption / Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a message, share a thought, tell a secret..."
              rows={3}
              className="w-full bg-brand-charcoal border border-gray-800 focus:border-brand-gold focus:outline-none rounded-xl p-3 text-sm resize-none text-white transition-colors"
            />
          </div>

          {/* Stickers & Accessories Drawer Toggle */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowStickers(!showStickers)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                selectedSticker || showStickers
                  ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/30'
                  : 'bg-brand-charcoal text-gray-400 border-gray-800 hover:text-white'
              }`}
            >
              <Smile className="w-4 h-4" />
              <span>{selectedSticker ? `Sticker: ${selectedSticker}` : 'Attach Sticker'}</span>
            </button>

            {selectedSticker && (
              <button
                type="button"
                onClick={() => setSelectedSticker(undefined)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            )}
          </div>

          {showStickers && (
            <div className="animate-slide-down">
              <StickerPicker onSelectSticker={handleSelectSticker} />
            </div>
          )}
        </form>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3 bg-brand-charcoal/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePostSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold text-sm shadow-md shadow-brand-gold/15 flex items-center gap-1.5 transition-all disabled:opacity-50"
            id="publish-post-btn"
          >
            {isSubmitting ? 'Publishing...' : 'Share with Close Friends'}
          </button>
        </div>
      </div>
    </div>
  );
};
