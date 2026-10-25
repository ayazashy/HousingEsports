import React from 'react';
import { MessageCircle } from 'lucide-react';
import AutoFitName from './AutoFitName';
import { getTeamLogoUrl, DEFAULT_UNKNOWN_LOGO } from '../utils/footballTeams';

/**
 * 365scores / Sofascore Style Sports Match Card
 * Clean layout: [Competitor 1 + Logo 24px] [Centered Time/Score/Status] [Logo 24px + Competitor 2]
 * Uses AutoFitName to auto-minimize participant name size without changing screen ratio.
 */
export default function SportsMatchCard({ 
  match, 
  p1, 
  p2, 
  isCurrent = false, 
  isNext = false, 
  isDone = false, 
  onSelectMatch, 
  onRemindMatch,
  onShowCelebration,
  compact = false,
  isPublicMode = false,
  eloDelta = null
}) {
  const p1Logo = getTeamLogoUrl(p1?.team);
  const p2Logo = getTeamLogoUrl(p2?.team);

  // User design rule: Team name shouldn't be written if logo is known; if unknown, write in very small font
  const hasKnownLogo1 = !!p1Logo && p1Logo !== DEFAULT_UNKNOWN_LOGO;
  const showTeam1 = !hasKnownLogo1 && !!p1?.team;

  const hasKnownLogo2 = !!p2Logo && p2Logo !== DEFAULT_UNKNOWN_LOGO;
  const showTeam2 = !hasKnownLogo2 && !!p2?.team;

  const isCompleted = isDone || match.status === 'completed' || match.status === 'walkover';
  const isRealMatchPlayed = match.status === 'completed' && match.score1 !== null && match.score2 !== null;
  const effectiveEloDelta = eloDelta || match._eloDelta || null;
  const p1Delta = isRealMatchPlayed && effectiveEloDelta?.p1Delta !== undefined ? effectiveEloDelta.p1Delta : null;
  const p2Delta = isRealMatchPlayed && effectiveEloDelta?.p2Delta !== undefined ? effectiveEloDelta.p2Delta : null;

  const hasPenalties = match.penalty1 !== null && match.penalty1 !== undefined &&
                       match.penalty2 !== null && match.penalty2 !== undefined;

  let centerContent = null;
  if (isCompleted) {
    centerContent = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <span className="numeric" style={{ fontSize: compact ? '0.98rem' : '1.25rem', fontWeight: 900, color: '#0F172A' }}>
            {match.score1 ?? 0}
          </span>
          <span style={{ color: '#94A3B8', fontWeight: 800 }}>-</span>
          <span className="numeric" style={{ fontSize: compact ? '0.98rem' : '1.25rem', fontWeight: 900, color: '#0F172A' }}>
            {match.score2 ?? 0}
          </span>
        </div>
        {hasPenalties ? (
          <span className="numeric" style={{ 
            fontSize: '0.62rem', 
            color: '#B45309', 
            background: '#FEF3C7', 
            border: '1px solid #FDE68A', 
            padding: '1px 5px', 
            borderRadius: '4px', 
            fontWeight: 800, 
            whiteSpace: 'nowrap',
            lineHeight: 1.2
          }}>
            ركلات ترجيح ({match.penalty1} - {match.penalty2})
          </span>
        ) : (
          <span style={{ fontSize: '0.62rem', color: '#059669', fontWeight: 800 }}>
            {match.status === 'walkover' ? 'انسحاب' : 'منتهية ✓'}
          </span>
        )}
      </div>
    );
  } else if (isCurrent) {
    centerContent = (
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <span className="badge badge-green" style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px' }}>
          الآن 🟢
        </span>
        {match.estimatedTime?.rangeStr ? (
          <span className="numeric" style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {match.estimatedTime.rangeStr}
          </span>
        ) : null}
      </div>
    );
  } else if (isNext) {
    centerContent = (
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <span className="badge badge-gold" style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px' }}>
          التالية ⏳
        </span>
        {match.estimatedTime?.rangeStr ? (
          <span className="numeric" style={{ fontSize: '0.72rem', color: '#854D0E', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {match.estimatedTime.rangeStr}
          </span>
        ) : null}
      </div>
    );
  } else {
    centerContent = (
      <div style={{ textAlign: 'center' }}>
        <span className="numeric" style={{ 
          fontSize: '0.74rem', 
          fontWeight: 700, 
          color: '#334155', 
          background: '#F1F5F9', 
          padding: '3px 8px', 
          borderRadius: '5px', 
          border: '1px solid #E2E8F0',
          display: 'inline-block',
          whiteSpace: 'nowrap'
        }}>
          {match.estimatedTime?.rangeStr ? `🕒 ${match.estimatedTime.rangeStr}` : 'مجدولة'}
        </span>
      </div>
    );
  }

  const isCelebrationClickable = isPublicMode && isCompleted && typeof onShowCelebration === 'function';
  const isClickable = (!isPublicMode && typeof onSelectMatch === 'function') || isCelebrationClickable;
  const showRemindBtn = !isCompleted && !isPublicMode && typeof onRemindMatch === 'function';

  const handleClick = () => {
    if (isCelebrationClickable) {
      onShowCelebration(match);
    } else if (!isPublicMode && typeof onSelectMatch === 'function') {
      onSelectMatch(match);
    }
  };

  return (
    <div 
      onClick={isClickable ? handleClick : undefined}
      style={{
        display: 'grid',
        gridTemplateColumns: showRemindBtn ? 'minmax(0, 1fr) auto minmax(0, 1fr) auto' : 'minmax(0, 1fr) auto minmax(0, 1fr)',
        alignItems: 'center',
        padding: compact ? '4px 6px' : '6px 8px',
        background: isCurrent ? '#ECFDF5' : (isNext ? '#FEF9C3' : (isCompleted ? '#F8FAFC' : '#FFFFFF')),
        border: `1.5px solid ${isCurrent ? '#059669' : (isNext ? '#CA8A04' : (isCompleted ? '#CBD5E1' : 'var(--border-light)'))}`,
        borderRadius: '8px',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        gap: compact ? '4px' : '6px',
        width: '100%',
        boxSizing: 'border-box'
      }}
      title={
        isCelebrationClickable 
          ? "اضغط لمشاهدة احتفال الفوز والتفاعل المباشر 🎉" 
          : (isClickable ? "اضغط لرصد أو تعديل نتيجة المباراة" : undefined)
      }
    >
      {/* Competitor 1 (Right in Arabic RTL): [Name 1] then [Logo 1] (adjacent to Time) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px', 
        minWidth: 0, 
        width: '100%',
        overflow: 'hidden'
      }}>
        <div style={{ minWidth: 0, textAlign: 'right', flex: 1 }}>
          <AutoFitName 
            text={p1?.name || match.player1Placeholder || 'اللاعب 1'}
            compact={compact}
            color={isCurrent ? '#065F46' : 'var(--text-main)'}
            fontWeight={800}
            align="right"
          />
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            justifyContent: 'flex-start',
            marginTop: '1px',
            flexWrap: 'nowrap',
            overflow: 'hidden'
          }}>
            {showTeam1 && (
              <span style={{ 
                fontSize: '0.62rem', 
                color: 'var(--text-muted)', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis'
              }}>
                {p1.team}
              </span>
            )}
            {p1Delta !== null && (
              <span 
                className="numeric"
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '0px 4px',
                  borderRadius: '3px',
                  background: p1Delta > 0 ? '#DCFCE7' : (p1Delta < 0 ? '#FEE2E2' : '#F1F5F9'),
                  color: p1Delta > 0 ? '#15803D' : (p1Delta < 0 ? '#B91C1C' : '#475569'),
                  border: `1px solid ${p1Delta > 0 ? '#86EFAC' : (p1Delta < 0 ? '#FCA5A5' : '#CBD5E1')}`,
                  lineHeight: '13px',
                  display: 'inline-block',
                  whiteSpace: 'nowrap'
                }}
                title={`تغير تصنيف ELO: ${p1Delta > 0 ? '+' : ''}${p1Delta}`}
              >
                {p1Delta > 0 ? `+${p1Delta}` : p1Delta}
              </span>
            )}
          </div>
        </div>
        {p1Logo ? (
          <img 
            src={p1Logo} 
            alt={p1?.team || 'فريق 1'} 
            style={{ 
              width: compact ? '22px' : '24px', 
              height: compact ? '22px' : '24px', 
              objectFit: 'contain', 
              flexShrink: 0 
            }} 
            onError={(e) => { e.target.src = DEFAULT_UNKNOWN_LOGO; }}
          />
        ) : (
          <div style={{ 
            width: compact ? '22px' : '24px', 
            height: compact ? '22px' : '24px', 
            borderRadius: '50%', 
            background: '#E2E8F0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '0.75rem', 
            flexShrink: 0 
          }}>
            🎮
          </div>
        )}
      </div>

      {/* Center: Score / Time / Status Badge */}
      <div style={{ flexShrink: 0, padding: '0 3px', textAlign: 'center' }}>
        {centerContent}
      </div>

      {/* Competitor 2 (Left in Arabic RTL): [Logo 2] (adjacent to Time) then [Name 2] */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px', 
        minWidth: 0, 
        width: '100%',
        overflow: 'hidden'
      }}>
        {p2Logo ? (
          <img 
            src={p2Logo} 
            alt={p2?.team || 'فريق 2'} 
            style={{ 
              width: compact ? '22px' : '24px', 
              height: compact ? '22px' : '24px', 
              objectFit: 'contain', 
              flexShrink: 0 
            }} 
            onError={(e) => { e.target.src = DEFAULT_UNKNOWN_LOGO; }}
          />
        ) : (
          <div style={{ 
            width: compact ? '22px' : '24px', 
            height: compact ? '22px' : '24px', 
            borderRadius: '50%', 
            background: '#E2E8F0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '0.75rem', 
            flexShrink: 0 
          }}>
            🎮
          </div>
        )}
        <div style={{ minWidth: 0, textAlign: 'left', flex: 1 }}>
          <AutoFitName 
            text={p2?.name || match.player2Placeholder || 'اللاعب 2'}
            compact={compact}
            color={isCurrent ? '#065F46' : 'var(--text-main)'}
            fontWeight={800}
            align="left"
          />
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            justifyContent: 'flex-end',
            marginTop: '1px',
            flexWrap: 'nowrap',
            overflow: 'hidden'
          }}>
            {p2Delta !== null && (
              <span 
                className="numeric"
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '0px 4px',
                  borderRadius: '3px',
                  background: p2Delta > 0 ? '#DCFCE7' : (p2Delta < 0 ? '#FEE2E2' : '#F1F5F9'),
                  color: p2Delta > 0 ? '#15803D' : (p2Delta < 0 ? '#B91C1C' : '#475569'),
                  border: `1px solid ${p2Delta > 0 ? '#86EFAC' : (p2Delta < 0 ? '#FCA5A5' : '#CBD5E1')}`,
                  lineHeight: '13px',
                  display: 'inline-block',
                  whiteSpace: 'nowrap'
                }}
                title={`تغير تصنيف ELO: ${p2Delta > 0 ? '+' : ''}${p2Delta}`}
              >
                {p2Delta > 0 ? `+${p2Delta}` : p2Delta}
              </span>
            )}
            {showTeam2 && (
              <span style={{ 
                fontSize: '0.62rem', 
                color: 'var(--text-muted)', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis'
              }}>
                {p2.team}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick WhatsApp Reminder Action (Only for Organizers when match is not done) */}
      {showRemindBtn && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemindMatch(match);
          }}
          title="إرسال تذكير واتساب بالموعد"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#25D366',
            padding: '3px',
            cursor: 'pointer',
            borderRadius: '4px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <MessageCircle size={15} />
        </button>
      )}
    </div>
  );
}
