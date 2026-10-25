import React, { useState, useMemo } from 'react';
import { Trophy, Award, Search, TrendingUp, TrendingDown, Minus, Info, Shield, Filter, UserCheck, Flame, ChevronRight, X } from 'lucide-react';
import { simulateTournamentElo, ELO_TIERS, DEFAULT_ELO, STAGE_NAMES_AR } from '../utils/eloEngine';
import { getTeamLogoUrl, DEFAULT_UNKNOWN_LOGO } from '../utils/footballTeams';

export default function EloLeaderboardTab({ 
  matches = [], 
  participants = [],
  isPublicMode = false 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  // Run deterministic chronological ELO simulation
  const eloResult = useMemo(() => {
    return simulateTournamentElo(matches, participants);
  }, [matches, participants]);

  const { rankedPlayers, unrankedPlayers, allPlayers, totalMatchesCount } = eloResult;

  // Top 3 Podium
  const top1 = rankedPlayers[0] || null;
  const top2 = rankedPlayers[1] || null;
  const top3 = rankedPlayers[2] || null;

  // Filtered players
  const filteredPlayers = useMemo(() => {
    let list = allPlayers;

    // Filter by tier
    if (selectedTier !== 'all') {
      if (selectedTier === 'unranked') {
        list = list.filter(p => !p.isRanked);
      } else {
        list = list.filter(p => p.isRanked && p.tier?.id === selectedTier);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.team && p.team.toLowerCase().includes(q)) ||
        (p.room && String(p.room).includes(q)) ||
        (p.building && String(p.building).includes(q))
      );
    }

    return list;
  }, [allPlayers, selectedTier, searchQuery]);

  return (
    <div className="elo-tab-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hero Banner & Summary Metrics */}
      <div className="clean-card" style={{ 
        padding: '24px', 
        background: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)', 
        color: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(6, 78, 59, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        border: 'none'
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(253, 224, 71, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.8rem' }}>🏆</span>
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF' }}>
                تصنيف لاعبي فيفا بالسكن (FC27 ELO)
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#D1FAE5', maxWidth: '650px', lineHeight: 1.6 }}>
              التصنيف الرسمي التنافسي المعتمد للاعبي الإسكان الطلابي، يحسب قوة كل لاعب بناءً على نتائج المواجهات، وفارق الأهداف، وصعوبة الأدوار الإقصائية.
            </p>
          </div>

          <button 
            type="button"
            className="btn"
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            style={{ 
              background: 'rgba(255, 255, 255, 0.15)', 
              color: '#FFFFFF', 
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(4px)',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Info size={16} />
            <span>معايير احتساب التقييم</span>
          </button>
        </div>

        {/* Tournament Elo Quick Metrics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '12px', 
          marginTop: '20px',
          paddingTop: '18px',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px 14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.74rem', color: '#A7F3D0', fontWeight: 700 }}>المصنفون (خاضوا مباريات)</div>
            <div className="numeric" style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px' }}>
              {rankedPlayers.length} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>لاعب</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px 14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.74rem', color: '#A7F3D0', fontWeight: 700 }}>غير مصنف (لم يلعبوا)</div>
            <div className="numeric" style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px' }}>
              {unrankedPlayers.length} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>لاعب</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px 14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.74rem', color: '#FEF08A', fontWeight: 700 }}>أعلى تقييم (البطل)</div>
            <div className="numeric" style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px', color: '#FEF08A' }}>
              {top1?.elo || DEFAULT_ELO} ELO
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px 14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.74rem', color: '#A7F3D0', fontWeight: 700 }}>المباريات المحتسبة بالتقييم</div>
            <div className="numeric" style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px' }}>
              {totalMatchesCount} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>مباراة فعلية</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formula Explanation Collapsible Box */}
      {showFormulaInfo && (
        <div className="clean-card" style={{ 
          padding: '18px 22px', 
          background: '#F0FDF4', 
          border: '1.5px solid #86EFAC', 
          borderRadius: '12px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#065F46', fontSize: '0.95rem' }}>
              <Shield size={18} />
              <span>قواعد ومعادلة نظام ELO لبطولة كأس السكن FC27:</span>
            </div>
            <button 
              type="button" 
              onClick={() => setShowFormulaInfo(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={18} />
            </button>
          </div>
          <ul style={{ margin: 0, paddingRight: '20px', fontSize: '0.84rem', color: '#166534', lineHeight: 1.8 }}>
            <li><b>نقطة الانطلاق الموحدة:</b> يبدأ جميع المشاركين من تقييم أساسي قدره <b>500 نقطة</b>.</li>
            <li><b>استبعاد المنسحبين تماماً:</b> لا تُحتسب مباريات الانسحاب (Walkover) في تقييم أي لاعب، ويتم احتساب المباريات الفعلية التي لُعبت بالكامل فقط.</li>
            <li><b>غير المصنفين:</b> اللاعب الذي لم يخض أي مباراة فعلية في البطولة يصنف كـ <b>"غير مصنف"</b> حتى يخوض أول مباراة رسمية له.</li>
            <li><b>مضاعف الأدوار الإقصائية (K-Factor):</b> تزداد قيمة النقاط تدريجياً بحسب مرحلة البطولة (المجموعات: 32، دور الـ32: 36، ثمن النهائي: 40، ربع النهائي: 44، نصف النهائي: 48، النهائي: 56).</li>
            <li><b>مضاعف فارق الأهداف (Goal Margin):</b> الفوز بفارق أهداف كبير (مثل 4 أو 5 أهداف) يمنح نقاطاً إضافية تعكس السيطرة التامة.</li>
            <li><b>ميزان الصعوبة:</b> الفوز على خصم ذي تصنيف أعلى يمنح الفائز نقاطاً أكبر، بينما الخسارة من خصم أعلى تقتطع نقاطاً أقل.</li>
          </ul>
        </div>
      )}

      {/* Top 3 Podium (منصة التتويج) */}
      {top1 && top2 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '16px',
          alignItems: 'end'
        }}>
          {/* 2nd Place */}
          <div className="clean-card" style={{ 
            padding: '18px', 
            textAlign: 'center', 
            background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)', 
            border: '2px solid #CBD5E1', 
            borderRadius: '14px',
            position: 'relative'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🥈</div>
            <div className="badge badge-gray" style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 10px', marginBottom: '8px' }}>
              المركز الثاني (الوصيف)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              {getTeamLogoUrl(top2.team) && (
                <img src={getTeamLogoUrl(top2.team)} alt={top2.team} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              )}
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {top2.name}
              </h3>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              {top2.team} • مبنى {top2.building || '—'} / غ {top2.room || '—'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span className="numeric" style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A' }}>
                {top2.elo} ELO
              </span>
              <span className="badge badge-green numeric" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                +{top2.deltaTotal}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              {top2.played} مباريات ({top2.won} فوز • {top2.lost} خسارة)
            </div>
          </div>

          {/* 1st Place (Champion) - Elevated */}
          <div className="clean-card" style={{ 
            padding: '24px 20px', 
            textAlign: 'center', 
            background: 'linear-gradient(180deg, #FEFCE8 0%, #FEF9C3 100%)', 
            border: '2.5px solid #EAB308', 
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(234, 179, 8, 0.25)',
            transform: 'translateY(-6px)',
            position: 'relative'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '-14px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              background: '#EAB308',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '0.74rem',
              padding: '3px 14px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              بطل التصنيف الأول 👑
            </div>

            <div style={{ fontSize: '2.6rem', marginBottom: '4px', marginTop: '4px' }}>🥇</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '6px' }}>
              {getTeamLogoUrl(top1.team) && (
                <img src={getTeamLogoUrl(top1.team)} alt={top1.team} style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
              )}
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#713F12' }}>
                {top1.name}
              </h3>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#854D0E', fontWeight: 700, marginBottom: '12px' }}>
              {top1.team} • مبنى {top1.building || '—'} / غ {top1.room || '—'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span className="numeric" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#713F12' }}>
                {top1.elo} ELO
              </span>
              <span className="badge badge-gold numeric" style={{ fontSize: '0.88rem', fontWeight: 900, padding: '4px 10px' }}>
                +{top1.deltaTotal}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#854D0E', marginTop: '10px', fontWeight: 700 }}>
              علامة كاملة: {top1.played} انتصارات من {top1.played} مباريات (100% نسبة فوز)
            </div>
          </div>

          {/* 3rd Place */}
          {top3 && (
            <div className="clean-card" style={{ 
              padding: '18px', 
              textAlign: 'center', 
              background: 'linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)', 
              border: '2px solid #FDBA74', 
              borderRadius: '14px',
              position: 'relative'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🥉</div>
              <div className="badge badge-gold" style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 10px', marginBottom: '8px' }}>
                المركز الثالث
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                {getTeamLogoUrl(top3.team) && (
                  <img src={getTeamLogoUrl(top3.team)} alt={top3.team} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                )}
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#7C2D12' }}>
                  {top3.name}
                </h3>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9A3412', marginBottom: '10px' }}>
                {top3.team} • مبنى {top3.building || '—'} / غ {top3.room || '—'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span className="numeric" style={{ fontSize: '1.4rem', fontWeight: 900, color: '#7C2D12' }}>
                  {top3.elo} ELO
                </span>
                <span className="badge badge-green numeric" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                  +{top3.deltaTotal}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9A3412', marginTop: '8px' }}>
                {top3.played} مباريات ({top3.won} فوز • {top3.lost} خسارة)
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Chips & Search Bar */}
      <div className="clean-card" style={{ padding: '16px 20px', marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="ابحث باسم اللاعب، النادي، المبنى أو الغرفة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingRight: '36px', fontSize: '0.88rem', height: '40px' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Tier Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${selectedTier === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedTier('all')}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              الكل ({allPlayers.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedTier === 'elite' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedTier('elite')}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              💎 النخبة (600+)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedTier === 'gold' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedTier('gold')}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              🥇 الذهبي (550-599)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedTier === 'silver' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedTier('silver')}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              🥈 الفضي (500-549)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedTier === 'bronze' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedTier('bronze')}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              🥉 البرونزي (450-499)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedTier === 'challenger' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedTier('challenger')}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              🛡️ المتحدي (&lt;450)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedTier === 'unranked' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedTier('unranked')}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              ⚪ غير مصنف ({unrankedPlayers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="clean-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
            <Award size={18} color="var(--ksu-green)" />
            <span>جدول تصنيف اللاعبين بالسكن ({filteredPlayers.length} لاعب)</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            اضغط على أي لاعب لعرض سجل مسيرته وتفاصيل مبارياته كاملة
          </span>
        </div>

        <div className="table-wrapper" style={{ border: 'none', margin: 0 }}>
          <table className="clean-table" style={{ fontSize: '0.88rem' }}>
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>المركز</th>
                <th>اللاعب</th>
                <th>السكن</th>
                <th style={{ textAlign: 'center' }}>تقييم ELO</th>
                <th style={{ textAlign: 'center' }}>التغير (Δ)</th>
                <th style={{ textAlign: 'center' }}>المباريات (ف/ت/خ)</th>
                <th style={{ textAlign: 'center' }}>الأهداف</th>
                <th style={{ textAlign: 'center' }}>الرتبة</th>
                <th style={{ width: '80px', textAlign: 'center' }}>التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    لم يتم العثور على أي لاعب مطابق للبحث أو الفئة المحددة.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((p) => {
                  const isTop3 = p.rank && p.rank <= 3;
                  const deltaSign = p.deltaTotal > 0 ? '+' : '';
                  const tier = p.tier;

                  return (
                    <tr 
                      key={p.id}
                      onClick={() => setSelectedPlayer(p)}
                      style={{ 
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      className="elo-table-row"
                    >
                      {/* Rank */}
                      <td style={{ textAlign: 'center' }}>
                        {p.rank ? (
                          <span style={{ 
                            fontWeight: 900, 
                            fontSize: isTop3 ? '1.05rem' : '0.88rem',
                            color: p.rank === 1 ? '#D97706' : (p.rank === 2 ? '#64748B' : (p.rank === 3 ? '#B45309' : 'var(--text-main)'))
                          }}>
                            {p.rank === 1 ? '🥇 1' : (p.rank === 2 ? '🥈 2' : (p.rank === 3 ? '🥉 3' : `#${p.rank}`))}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>

                      {/* Player & Team */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {getTeamLogoUrl(p.team) ? (
                            <img 
                              src={getTeamLogoUrl(p.team)} 
                              alt={p.team} 
                              style={{ width: '28px', height: '28px', objectFit: 'contain', flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                              🎮
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {p.team || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Housing info */}
                      <td>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 600 }}>
                          مبنى {p.building || '—'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          غرفة {p.room || '—'}
                        </div>
                      </td>

                      {/* ELO Rating */}
                      <td style={{ textAlign: 'center' }}>
                        {p.isRanked ? (
                          <span 
                            className="numeric"
                            style={{ 
                              fontWeight: 900, 
                              fontSize: '1rem', 
                              padding: '3px 10px', 
                              borderRadius: '6px',
                              background: tier.bgColor,
                              color: tier.color,
                              border: `1px solid ${tier.borderColor}`
                            }}
                          >
                            {p.elo}
                          </span>
                        ) : (
                          <span className="badge badge-gray" style={{ fontSize: '0.74rem', padding: '3px 8px' }}>
                            غير مصنف
                          </span>
                        )}
                      </td>

                      {/* Net Delta */}
                      <td style={{ textAlign: 'center' }}>
                        {p.isRanked ? (
                          <span 
                            className="numeric"
                            style={{ 
                              fontWeight: 800, 
                              fontSize: '0.85rem',
                              color: p.deltaTotal > 0 ? '#15803D' : (p.deltaTotal < 0 ? '#B91C1C' : '#64748B'),
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            {p.deltaTotal > 0 ? <TrendingUp size={14} /> : (p.deltaTotal < 0 ? <TrendingDown size={14} /> : <Minus size={14} />)}
                            <span>{deltaSign}{p.deltaTotal}</span>
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>0</span>
                        )}
                      </td>

                      {/* W / D / L */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="numeric" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                          <span style={{ color: '#15803D' }}>{p.won}</span>
                          <span style={{ color: '#94A3B8' }}> / </span>
                          <span style={{ color: '#64748B' }}>{p.drawn}</span>
                          <span style={{ color: '#94A3B8' }}> / </span>
                          <span style={{ color: '#B91C1C' }}>{p.lost}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          من {p.played} مباريات
                        </div>
                      </td>

                      {/* Goals (+/-) */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="numeric" style={{ fontWeight: 700, fontSize: '0.85rem', color: p.goalDiff > 0 ? '#15803D' : (p.goalDiff < 0 ? '#B91C1C' : 'var(--text-main)') }}>
                          {p.goalDiff > 0 ? `+${p.goalDiff}` : p.goalDiff}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {p.goalsFor} له • {p.goalsAgainst} عليه
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td style={{ textAlign: 'center' }}>
                        <span 
                          style={{ 
                            fontSize: '0.74rem', 
                            fontWeight: 800, 
                            padding: '3px 8px', 
                            borderRadius: '12px',
                            background: tier.bgColor,
                            color: tier.color,
                            border: `1px solid ${tier.borderColor}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span>{tier.icon}</span>
                          <span>{tier.name}</span>
                        </span>
                      </td>

                      {/* Details CTA */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem', height: 'auto', minHeight: 'unset' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlayer(p);
                          }}
                        >
                          المسيرة
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Player Match History Modal */}
      {selectedPlayer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="clean-card" style={{
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.2s ease'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {getTeamLogoUrl(selectedPlayer.team) ? (
                  <img 
                    src={getTeamLogoUrl(selectedPlayer.team)} 
                    alt={selectedPlayer.team} 
                    style={{ width: '42px', height: '42px', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    🎮
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF' }}>
                      {selectedPlayer.name}
                    </h3>
                    <span style={{ 
                      fontSize: '0.74rem', 
                      padding: '2px 8px', 
                      borderRadius: '10px', 
                      background: 'rgba(255,255,255,0.2)', 
                      color: '#FFFFFF', 
                      fontWeight: 800 
                    }}>
                      {selectedPlayer.tier?.icon} {selectedPlayer.tier?.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#D1FAE5', marginTop: '3px' }}>
                    {selectedPlayer.team || 'فريق'} • مبنى {selectedPlayer.building || '—'} / غ {selectedPlayer.room || '—'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlayer(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Stats Row + Match History Timeline */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Quick Stat Bar */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '10px',
                background: '#F8FAFC',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>التقييم الحالي</div>
                  <div className="numeric" style={{ fontSize: '1.25rem', fontWeight: 900, color: selectedPlayer.isRanked ? 'var(--ksu-green)' : '#94A3B8' }}>
                    {selectedPlayer.isRanked ? selectedPlayer.elo : 'غير مصنف'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>إجمالي التغير</div>
                  <div className="numeric" style={{ fontSize: '1.25rem', fontWeight: 900, color: selectedPlayer.deltaTotal > 0 ? '#15803D' : (selectedPlayer.deltaTotal < 0 ? '#B91C1C' : '#64748B') }}>
                    {selectedPlayer.deltaTotal > 0 ? `+${selectedPlayer.deltaTotal}` : selectedPlayer.deltaTotal}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>المباريات الملعوبة</div>
                  <div className="numeric" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>
                    {selectedPlayer.played}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>أعلى تقييم مسجل</div>
                  <div className="numeric" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#D97706' }}>
                    {selectedPlayer.highestElo}
                  </div>
                </div>
              </div>

              {/* History Timeline */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  سجل تطور التقييم في مباريات البطولة ({selectedPlayer.eloHistory.length - 1} مباراة فعلية):
                </h4>

                {selectedPlayer.eloHistory.length <= 1 ? (
                  <div style={{ textAlign: 'center', padding: '30px', background: '#F8FAFC', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    لم يخض هذا اللاعب أي مواجهة رسمية مكتملة في البطولة حتى الآن.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedPlayer.eloHistory.slice(1).map((h, idx) => {
                      const isWin = h.isWin === true;
                      const isDraw = h.isWin === 'draw';
                      const isLoss = h.isWin === false;

                      return (
                        <div 
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '10px',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: isWin ? '#F0FDF4' : (isDraw ? '#F8FAFC' : '#FEF2F2'),
                            border: `1px solid ${isWin ? '#BBF7D0' : (isDraw ? '#E2E8F0' : '#FECACA')}`
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              fontWeight: 800, 
                              padding: '2px 8px', 
                              borderRadius: '4px',
                              background: isWin ? '#DCFCE7' : (isDraw ? '#E2E8F0' : '#FEE2E2'),
                              color: isWin ? '#15803D' : (isDraw ? '#475569' : '#B91C1C')
                            }}>
                              {isWin ? 'فوز ✓' : (isDraw ? 'تعادل' : 'خسارة')}
                            </span>
                            <div>
                              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                ضد: {h.opponentName} {h.opponentTeam ? `(${h.opponentTeam})` : ''}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {h.stageName} • نتيجة: <b className="numeric">{h.score}</b>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'left' }}>
                              <span 
                                className="numeric" 
                                style={{ 
                                  fontWeight: 900, 
                                  fontSize: '0.92rem',
                                  color: h.delta > 0 ? '#15803D' : (h.delta < 0 ? '#B91C1C' : '#64748B')
                                }}
                              >
                                {h.delta > 0 ? `+${h.delta}` : h.delta}
                              </span>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                نقطة
                              </div>
                            </div>

                            <div style={{ 
                              padding: '4px 10px', 
                              background: '#FFFFFF', 
                              borderRadius: '6px', 
                              border: '1px solid #CBD5E1',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>التقييم بعد</div>
                              <div className="numeric" style={{ fontWeight: 900, fontSize: '0.95rem', color: '#0F172A' }}>
                                {h.eloAfter}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', background: '#F8FAFC' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedPlayer(null)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
