import React, { useState } from 'react';
import { Plus, X, Users, Gamepad2, Layers, Calendar } from 'lucide-react';

export default function HousingCupPortal({
  cups = [],
  onSelectCup,
  userRole = null,
  isAdminRoute = false,
  onSaveCupsList,
  onNotify
}) {
  const [showAddCupModal, setShowAddCupModal] = useState(false);
  const [editingCup, setEditingCup] = useState(null);

  // Form State for Adding / Editing Cup (Master Admin only)
  const [cupForm, setCupForm] = useState({
    id: '',
    title: '',
    game: '',
    dates: '22 - 24 أكتوبر 2026',
    participantsCount: 32,
    groupsCount: 8,
    matchesCount: 0,
    logo: './housingcup-logo.png'
  });

  const isMasterAdmin = isAdminRoute && userRole === 'master_admin';

  // Calculate top aggregated stats
  const totalParticipants = cups.reduce((sum, c) => sum + (Number(c.participantsCount) || 0), 0);
  const totalGamesPlayed = cups.reduce((sum, c) => sum + (Number(c.matchesCount) || 0), 0);

  const handleOpenAdd = () => {
    setEditingCup(null);
    setCupForm({
      id: `cup_${Date.now()}`,
      title: '',
      game: '',
      participantsCount: 32,
      groupsCount: 8,
      matchesCount: 0,
      logo: './housingcup-logo.png'
    });
    setShowAddCupModal(true);
  };

  const handleOpenEdit = (cup, e) => {
    e.stopPropagation();
    setEditingCup(cup);
    setCupForm({ ...cup });
    setShowAddCupModal(true);
  };

  const handleDeleteCup = async (cupId, e) => {
    e.stopPropagation();
    if (cupId === 'fc27') {
      alert('لا يمكن حذف بطولة FC27 لأنها البطولة الأساسية المعتمدة.');
      return;
    }
    if (!window.confirm('هل أنت متأكد من حذف هذه البطولة؟')) {
      return;
    }
    const updated = cups.filter(c => c.id !== cupId);
    if (onSaveCupsList) {
      await onSaveCupsList(updated);
    }
    if (onNotify) onNotify('تم حذف البطولة بنجاح', 'info');
  };

  const handleSaveCupForm = async (e) => {
    e.preventDefault();
    if (!cupForm.id.trim()) {
      alert('يرجى تحديد معرف البطولة');
      return;
    }

    const newCup = {
      ...cupForm,
      id: editingCup ? editingCup.id : (cupForm.id || `cup_${Date.now()}`),
      docId: editingCup ? (editingCup.docId || `ksu_housing_${editingCup.id}_main`) : `ksu_housing_${cupForm.id || Date.now()}_main`
    };

    let updatedCups = [];
    if (editingCup) {
      updatedCups = cups.map(c => c.id === editingCup.id ? newCup : c);
    } else {
      updatedCups = [...cups, newCup];
    }

    if (onSaveCupsList) {
      await onSaveCupsList(updatedCups);
    }
    setShowAddCupModal(false);
    if (onNotify) onNotify(editingCup ? 'تم تحديث بيانات البطولة بنجاح' : 'تمت إضافة البطولة بنجاح', 'success');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '48px 20px',
      direction: 'rtl',
      fontFamily: 'inherit'
    }}>
      {/* Centered Housing Cup Main Logo */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <img 
          src="./housingcup-logo.png" 
          alt="شعار كأس السكن" 
          style={{
            height: '130px',
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.06))'
          }}
          onError={(e) => { e.currentTarget.src = './logo.png'; }}
        />
      </div>

      {/* Top Aggregated Stats: Total Participants & Games Played */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '36px',
        flexWrap: 'wrap',
        width: '100%',
        maxWidth: '850px'
      }}>
        {/* Total Participants Stat Card */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          borderRadius: '16px',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          minWidth: '220px'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(5, 150, 105, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ksu-green)'
          }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }} className="numeric">
              {totalParticipants}
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>
              إجمالي المشاركين
            </div>
          </div>
        </div>

        {/* Total Games Played Stat Card */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          borderRadius: '16px',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          minWidth: '220px'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(2, 132, 199, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284C7'
          }}>
            <Gamepad2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }} className="numeric">
              {totalGamesPlayed}
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>
              المباريات الملعوبة
            </div>
          </div>
        </div>
      </div>

      {/* Clear Section Header: البطولات */}
      <div style={{
        width: '100%',
        maxWidth: '850px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid #E2E8F0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={22} color="var(--ksu-green)" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            البطولات
          </h2>
        </div>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>
          {cups.length} {cups.length === 1 ? 'بطولة مسجلة' : 'بطولات مسجلة'}
        </span>
      </div>

      {/* Cups Grid */}
      <div style={{
        width: '100%',
        maxWidth: '850px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 320px))',
        gap: '24px',
        justifyContent: 'center'
      }}>
        {cups.map((cup) => (
          <div
            key={cup.id}
            onClick={() => onSelectCup(cup.id)}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '18px',
              padding: '28px 24px 20px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = 'var(--ksu-green)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            {/* Tournament Date Badge */}
            {cup.dates && (
              <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#64748B',
                  background: '#F1F5F9',
                  padding: '3px 10px',
                  borderRadius: '20px'
                }}>
                  <Calendar size={12} color="#64748B" />
                  <span>{cup.dates}</span>
                </span>
              </div>
            )}

            {/* Cup Game Logo Only */}
            <div style={{
              height: '110px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            }}>
              <img 
                src={cup.logo || './fc27-logo.png'} 
                alt="شعار البطولة" 
                style={{
                  maxHeight: '100px',
                  maxWidth: '85%',
                  objectFit: 'contain'
                }}
                onError={(e) => { e.currentTarget.src = './housingcup-logo.png'; }}
              />
            </div>

            {/* Numbers at bottom of the logo only */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px solid #F1F5F9',
              width: '100%',
              fontSize: '0.85rem',
              color: '#64748B'
            }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', display: 'block' }} className="numeric">
                  {cup.participantsCount || 0}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>لاعب</span>
              </div>
              <div style={{ width: '1px', height: '22px', background: '#E2E8F0' }} />
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', display: 'block' }} className="numeric">
                  {cup.groupsCount || 0}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>مجموعة</span>
              </div>
              <div style={{ width: '1px', height: '22px', background: '#E2E8F0' }} />
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', display: 'block' }} className="numeric">
                  {cup.matchesCount || 0}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>مباراة</span>
              </div>
            </div>

            {/* Master Admin Only Controls (Hidden completely for public) */}
            {isMasterAdmin && (
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  paddingTop: '8px',
                  borderTop: '1px dashed #E2E8F0',
                  width: '100%'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => handleOpenEdit(cup, e)}
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                >
                  تعديل الأرقام
                </button>
                {cup.id !== 'fc27' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => handleDeleteCup(cup.id, e)}
                    style={{ fontSize: '0.72rem', padding: '3px 8px', color: '#DC2626' }}
                  >
                    حذف
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Master Admin Only: Add New Cup Button (Hidden completely for public) */}
      {isMasterAdmin && (
        <div style={{ marginTop: '28px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.8rem' }}
          >
            <Plus size={15} />
            <span>إضافة بطولة جديدة للسجل</span>
          </button>
        </div>
      )}

      {/* Master Admin Modal (Hidden for public) */}
      {isMasterAdmin && showAddCupModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                {editingCup ? 'تعديل بيانات البطولة' : 'إضافة بطولة جديدة'}
              </h3>
              <button 
                onClick={() => setShowAddCupModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCupForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>معرف البطولة (ID):</label>
                <input 
                  type="text" 
                  value={cupForm.id} 
                  onChange={(e) => setCupForm({ ...cupForm, id: e.target.value })}
                  disabled={editingCup?.id === 'fc27'}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>رابط/مسار الشعار:</label>
                <input 
                  type="text" 
                  value={cupForm.logo} 
                  onChange={(e) => setCupForm({ ...cupForm, logo: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>تاريخ إقامة البطولة:</label>
                <input 
                  type="text" 
                  value={cupForm.dates || ''} 
                  onChange={(e) => setCupForm({ ...cupForm, dates: e.target.value })}
                  placeholder="مثال: 22 - 24 أكتوبر 2026"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>اللاعبين:</label>
                  <input 
                    type="number" 
                    value={cupForm.participantsCount} 
                    onChange={(e) => setCupForm({ ...cupForm, participantsCount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>المجموعات:</label>
                  <input 
                    type="number" 
                    value={cupForm.groupsCount} 
                    onChange={(e) => setCupForm({ ...cupForm, groupsCount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>المباريات:</label>
                  <input 
                    type="number" 
                    value={cupForm.matchesCount} 
                    onChange={(e) => setCupForm({ ...cupForm, matchesCount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setShowAddCupModal(false)}
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
