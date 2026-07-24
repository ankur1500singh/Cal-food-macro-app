import React, { useRef, useState } from 'react';

export default function FoodMacroApp() {
  const [screen, setScreen] = useState('home');
  const [foodResults, setFoodResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servings, setServings] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const searchFood = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://www.nutritionix.com/search/instant?q=${encodeURIComponent(query)}&v2=true`,
        {
          headers: {
            'x-app-id': 'a96df86c',
            'x-app-key': 'cd0a97a2ed02a4dffff3f7c6a0b3d5e0'
          }
        }
      );
      
      const data = await response.json();
      let results = [];
      
      if (data.branded && data.branded.length > 0) {
        results = data.branded.slice(0, 8);
      } else if (data.common && data.common.length > 0) {
        results = data.common.slice(0, 8);
      }
      
      if (results.length > 0) {
        setFoodResults(results);
        setScreen('results');
      } else {
        alert('No foods found. Try a different search.');
      }
    } catch (err) {
      console.error('Search error:', err);
      alert('Error searching. Try again.');
    }
    setLoading(false);
  };

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setScreen('search');
    }
  };

  const openCamera = async () => {
    setScreen('camera');
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        alert('Camera access denied. Use search instead.');
        setScreen('home');
      }
    }, 100);
  };

  const getTotals = () => {
    if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return {
      calories: Math.round((selectedFood.nf_calories || 0) * servings),
      protein: Math.round((selectedFood.nf_protein || 0) * servings * 10) / 10,
      carbs: Math.round((selectedFood.nf_total_carbohydrate || 0) * servings * 10) / 10,
      fat: Math.round((selectedFood.nf_total_fat || 0) * servings * 10) / 10,
    };
  };

  const totals = getTotals();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: 'Segoe UI, Roboto, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>

        {/* HOME SCREEN */}
        {screen === 'home' && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '3rem 1.5rem',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 0.5rem', color: '#1a1a1a' }}>
              FoodMacro
            </h1>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 2rem' }}>
              Instant calorie & macro tracking
            </p>
            
            <button
              onClick={openCamera}
              style={{
                width: '100%',
                padding: '1rem',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📷 Take a photo
            </button>

            <button
              onClick={() => setScreen('search')}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔍 Search for food
            </button>
          </div>
        )}

        {/* CAMERA SCREEN */}
        {screen === 'camera' && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ position: 'relative', background: '#000', height: '300px' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} width={320} height={240} />
              
              <button
                onClick={() => {
                  const stream = videoRef.current?.srcObject;
                  if (stream) stream.getTracks().forEach(track => track.stop());
                  setScreen('home');
                }}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button
                onClick={capturePhoto}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Capture
              </button>
              <button
                onClick={() => {
                  const stream = videoRef.current?.srcObject;
                  if (stream) stream.getTracks().forEach(track => track.stop());
                  setScreen('home');
                }}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* SEARCH SCREEN */}
        {screen === 'search' && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem 1.5rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="e.g. chicken, banana, rice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchFood(searchQuery)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={() => searchFood(searchQuery)}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {loading ? '...' : '🔍'}
              </button>
            </div>

            <button
              onClick={() => setScreen('home')}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#f0f0f0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                color: '#333'
              }}
            >
              Back to home
            </button>
          </div>
        )}

        {/* RESULTS SCREEN */}
        {screen === 'results' && !selectedFood && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 1rem', color: '#1a1a1a' }}>
              Select a food
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {foodResults.map((food, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFood(food)}
                  style={{
                    padding: '1rem',
                    background: '#f9f9f9',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.background = '#f9f9f9'}
                >
                  <div style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '0.25rem' }}>
                    {food.food_name || food.item_name || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {Math.round(food.nf_calories || 0)} cal
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setScreen('search')}
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#f0f0f0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                color: '#333'
              }}
            >
              Back to search
            </button>
          </div>
        )}

        {/* NUTRITION RESULTS */}
        {selectedFood && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem 1.5rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              margin: '0 0 0.5rem',
              color: '#1a1a1a',
              textTransform: 'capitalize'
            }}>
              {selectedFood.food_name || selectedFood.item_name || 'Food'}
            </h2>
            <p style={{ fontSize: '13px', color: '#999', margin: '0 0 1.5rem' }}>
              Per serving
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '0.5rem'
              }}>
                Servings: <strong style={{ color: '#667eea' }}>{servings}</strong>
              </label>
              <input
                type="range"
                min="0.25"
                max="5"
                step="0.25"
                value={servings}
                onChange={(e) => setServings(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '1.25rem',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '0.5rem' }}>
                  Calories
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700' }}>
                  {totals.calories}
                </div>
              </div>
              <div style={{
                background: '#f0f0f0',
                padding: '1.25rem',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '0.5rem' }}>
                  Per serving
                </div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>
                  {Math.round(selectedFood.nf_calories || 0)}
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                background: '#fff3e0',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>
                  Protein
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#f57c00' }}>
                  {totals.protein}g
                </div>
              </div>
              <div style={{
                background: '#e8f5e9',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>
                  Carbs
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#2e7d32' }}>
                  {totals.carbs}g
                </div>
              </div>
              <div style={{
                background: '#fce4ec',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>
                  Fat
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#c2185b' }}>
                  {totals.fat}g
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setSelectedFood(null);
                  setScreen('search');
                  setSearchQuery('');
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#333'
                }}
              >
                Search again
              </button>
              <button
                onClick={() => setScreen('home')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
