import { useFMSynth } from './FMSynthContext';

const carrierStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '15px',
  margin: '10px 0',
  backgroundColor: '#f9f9f9'
};

const controlsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '15px'
};

const carrierControlStyle = {
  padding: '10px',
  border: '1px solid #eee',
  borderRadius: '4px'
};

const opTitleStyle = {
  margin: '0 0 10px 0',
  textAlign: 'center'
};

const controlGroup = {
  marginBottom: '8px'
};
console.log("la");

const onCarrierChange = (id, what, value) => {
  console.log("onCarrierChange");

}
export const CarrierControls: React.FC = () => {

  const { currentAlgorithm } = useFMSynth();

  console.log("currentAlgorithm", currentAlgorithm);

  if (!currentAlgorithm) return null;

  const carriers = currentAlgorithm.ops.filter(op => op.type === 'carrier');
console.log("carriers", carriers);
  return (
    <div style={carrierStyle}>
      <h3>Carrier Controls</h3>
      <div style={controlsGrid}>
        {carriers.map(op => (
          <div key={`carrier-${op.id}`} style={carrierControlStyle}>
            <h4 style={opTitleStyle}>OP{op.id}</h4>
            <div style={controlGroup}>
              <label>Volume</label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="80"
                onChange={(e) => onCarrierChange(op.id, 'volume', e.target.value)}
              />
            </div>
            <div style={controlGroup}>
              <label>Pan</label>
              <input
                type="range"
                min="-100"
                max="100"
                defaultValue="0"
                onChange={(e) => onCarrierChange(op.id, 'pan', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarrierControls;