import React from 'react';

interface Props {
  onAddNode: () => void;
  onCenterMap: () => void;
  onToggleZoom: () => void;
  onToggleSearch: () => void;
  onBackup: () => void;
  zoomEnabled: boolean;
  searchOpen: boolean;
  showDonateHeart?: boolean;
}

export const TopologySidebar: React.FC<Props> = ({
  onAddNode,
  onCenterMap,
  onToggleZoom,
  onToggleSearch,
  onBackup,
  zoomEnabled,
  searchOpen,
  showDonateHeart,
}) => {
  return (
    <div style={bar}>
      <SidebarBtn icon={addIcon} tooltip="Add Node" onClick={onAddNode} />
      <SidebarBtn icon={centerIcon} tooltip="Center" onClick={onCenterMap} />
      <SidebarBtn icon={searchIcon} tooltip="Search" onClick={onToggleSearch} active={searchOpen} />
      <div style={separator} />
      <SidebarBtn
        icon={zoomEnabled ? zoomOnIcon : zoomOffIcon}
        tooltip={zoomEnabled ? 'Zoom: ON' : 'Zoom: OFF'}
        onClick={onToggleZoom}
        active={zoomEnabled}
      />
      <SidebarBtn icon={backupIcon} tooltip="Manage Backups" onClick={onBackup} />
      {showDonateHeart && (
        <>
          <div style={{ flex: 1 }} />
          <a
            href="https://www.paypal.com/donate/?business=Z9USFAAMBJ29S&no_recurring=0&item_name=Developing+the+Network+Topology+plugin+for+Grafana+to+solve+real+monitoring+issues.+Help+me+keep+the+project+evolving%21&currency_code=BRL"
            target="_blank"
            rel="noopener noreferrer"
            title="Donate to development"
            style={{
              ...btnBase,
              marginTop: 'auto',
              marginBottom: 16,
              color: '#fff',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              animation: 'nswGlowPulseSidebar 2s ease-in-out infinite',
              textDecoration: 'none',
              transform: 'none',
              fontSize: 16,
            }}
          >
            ❤️
          </a>
          <style>{`
            @keyframes nswGlowPulseSidebar {
              0%, 100% { box-shadow: 0 0 8px rgba(245,158,11,0.3); }
              50% { box-shadow: 0 0 18px rgba(245,158,11,0.6), 0 0 30px rgba(239,68,68,0.3); }
            }
          `}</style>
        </>
      )}
    </div>
  );
};

interface BtnProps {
  icon: string;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
}

const SidebarBtn: React.FC<BtnProps> = ({ icon, tooltip, onClick, active }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...btnBase,
          background: active
            ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.08))'
            : hovered
              ? 'rgba(255,255,255,0.08)'
              : 'transparent',
          color: active ? '#60a5fa' : hovered ? '#e0e0f0' : '#666',
          boxShadow: active ? '0 0 12px rgba(59,130,246,0.15)' : 'none',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
        }}
        title={tooltip}
        dangerouslySetInnerHTML={{ __html: icon }}
      />
      {hovered && <div style={tooltipStyle}>{tooltip}</div>}
    </div>
  );
};

const bar: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  width: 48,
  background: 'linear-gradient(180deg, rgba(12,12,22,0.95) 0%, rgba(18,18,32,0.95) 100%)',
  backdropFilter: 'blur(20px)',
  borderRight: '1px solid rgba(255,255,255,0.06)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: 10,
  gap: 4,
  zIndex: 20,
};

const btnBase: React.CSSProperties = {
  width: 36,
  height: 36,
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.18s ease',
  padding: 0,
};

const separator: React.CSSProperties = {
  width: 24,
  height: 1,
  background: 'rgba(255,255,255,0.06)',
  margin: '4px 0',
};

const tooltipStyle: React.CSSProperties = {
  position: 'absolute',
  left: 46,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'rgba(15,15,28,0.96)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '5px 12px',
  fontSize: 11,
  fontWeight: 500,
  color: '#e0e0f0',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  zIndex: 100,
  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(12px)',
};

const addIcon =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
const centerIcon =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>';
const searchIcon =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>';
const zoomOnIcon =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
const zoomOffIcon =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
const backupIcon =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
