import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Bell, X, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';

export const AlarmView = () => {
  const navigate = useNavigate();
  const [alarms, setAlarms] = useState(() => {
    const savedAlarms = localStorage.getItem('alarms');
    return savedAlarms ? JSON.parse(savedAlarms) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStopAlarmModal, setShowStopAlarmModal] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [activeAlarmId, setActiveAlarmId] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [newAlarm, setNewAlarm] = useState({
    time: '',
    label: '',
    days: [],
    isActive: true
  });
  const [lastTriggeredTime, setLastTriggeredTime] = useState('');

  useEffect(() => {
    localStorage.setItem('alarms', JSON.stringify(alarms));
  }, [alarms]);
  const stopAlarm = useCallback(() => {
    console.log('Stopping alarm...');
    if (currentAudio) {
      try {
        if (currentAudio.stop) {
          currentAudio.stop();
        }
        console.log('Audio stopped and cleaned up');
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    }
    setShowStopAlarmModal(false);
    setIsAlarmPlaying(false);
    setActiveAlarmId(null);
    setCurrentAudio(null);
    // Save the current time to prevent immediate restart
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);
    setLastTriggeredTime(currentTime);
    console.log('Alarm state reset');
  }, [currentAudio]);

  const createAlarmSound = async () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    await audioContext.resume();
    
    // Create audio nodes
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Set up two-tone alarm sound
    oscillator1.type = 'square';
    oscillator1.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    oscillator2.type = 'square';
    oscillator2.frequency.setValueAtTime(554.37, audioContext.currentTime); // C#5

    // Set up volume
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

    // Create volume modulation for pulsing effect
    const pulseSpeed = 4; // pulses per second
    const currentTime = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.setValueCurveAtTime(
      new Float32Array([0, 0.2, 0]), 
      currentTime, 
      1/pulseSpeed
    );
    gainNode.gain.setValueCurveAtTime(
      new Float32Array([0, 0.2, 0]), 
      currentTime + 1/pulseSpeed, 
      1/pulseSpeed
    );

    // Connect nodes
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start oscillators
    oscillator1.start();
    oscillator2.start();

    // Set up repeating pulse pattern
    const pulseInterval = setInterval(() => {
      const now = audioContext.currentTime;
      gainNode.gain.setValueCurveAtTime(
        new Float32Array([0, 0.2, 0]), 
        now, 
        1/pulseSpeed
      );
    }, (1000/pulseSpeed));

    return {
      stop() {
        try {
          clearInterval(pulseInterval);
          oscillator1.stop();
          oscillator2.stop();
          gainNode.gain.cancelScheduledValues(audioContext.currentTime);
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          setTimeout(() => {
            audioContext.close();
          }, 100);
        } catch (e) {
          console.error('Error stopping audio:', e);
        }
      }
    };
  };
  const createMP3AlarmSound = async () => {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio('/Just made an alarm for you.mp3');
        audio.loop = true;
        
        // Handle loading events
        audio.addEventListener('canplaythrough', () => {
          console.log('Audio loaded and ready to play');
          resolve({
            async start() {
              try {
                await audio.play();
                console.log('Audio playback started');
              } catch (error) {
                console.error('Error starting audio:', error);
                throw error;
              }
            },
            stop() {
              try {
                audio.pause();
                audio.currentTime = 0;
                // Release the audio resource
                audio.src = '';
                audio.load();
              } catch (e) {
                console.error('Error stopping audio:', e);
              }
            }
          });
        }, { once: true });

        // Handle loading errors
        audio.addEventListener('error', (e) => {
          const error = e.target.error;
          console.error('Audio loading error:', error);
          reject(new Error('Failed to load audio file'));
        }, { once: true });

      } catch (error) {
        console.error('Error creating audio:', error);
        reject(error);
      }
    });
  };

  const playAlarm = async (alarmId) => {
    try {
      console.log('Attempting to play alarm...');
      
      // Stop any existing alarm first
      if (currentAudio) {
        currentAudio.stop();
      }
        let alarm;
      try {
        // Try to play MP3 first
        console.log('Attempting to play MP3 alarm sound...');
        alarm = await createMP3AlarmSound();
        console.log('Successfully created MP3 alarm');
        await alarm.start(); // Start the audio playback
      } catch (error) {
        // Fall back to synthesized sound if MP3 fails
        console.log('Falling back to synthesized alarm sound:', error);
        alarm = await createAlarmSound();
        console.log('Successfully created synthesized alarm');
      }
      
      // Save references for cleanup
      setCurrentAudio(alarm);
      setIsAlarmPlaying(true);
      setActiveAlarmId(alarmId);
      setShowStopAlarmModal(true);
      
      console.log('Alarm sound started successfully');
    } catch (error) {
      console.error('Error playing alarm:', error);
      alert('Failed to play alarm sound: ' + error.message);
      stopAlarm();
    }
  };
  useEffect(() => {
    let lastCheckTime = '';
    const checkAlarms = setInterval(() => {
      if (isAlarmPlaying) return;

      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);
      const currentDay = now.getDay();

      // Skip if we've already checked this minute
      if (currentTime === lastCheckTime) return;
      lastCheckTime = currentTime;

      // Don't trigger again in the same minute after stopping
      if (currentTime === lastTriggeredTime) return;

      console.log('Checking alarms at:', currentTime);
      
      alarms.forEach(alarm => {
        if (alarm.isActive && alarm.time === currentTime && !isAlarmPlaying) {
          console.log('Alarm match found!');
          if (alarm.days.length === 0 || alarm.days.includes(currentDay)) {
            console.log('Playing alarm for:', alarm.label || 'Unnamed alarm');
            playAlarm(alarm.id);
          }
        }
      });
    }, 1000);

    return () => {
      clearInterval(checkAlarms);
      if (currentAudio) {
        try {
          currentAudio.stop();
        } catch (error) {
          console.error('Error stopping audio on cleanup:', error);
        }
      }
    };
  }, [alarms, isAlarmPlaying, playAlarm, currentAudio, lastTriggeredTime]);

  const handleAddAlarm = (e) => {
    e.preventDefault();
    if (!newAlarm.time) return;

    setAlarms(prevAlarms => [...prevAlarms, { ...newAlarm, id: Date.now() }]);
    setNewAlarm({ time: '', label: '', days: [], isActive: true });
    setShowAddModal(false);
  };

  const toggleAlarm = (id) => {
    setAlarms(prevAlarms =>
      prevAlarms.map(alarm =>
        alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
      )
    );
  };

  const deleteAlarm = (id) => {
    setAlarms(prevAlarms => prevAlarms.filter(alarm => alarm.id !== id));
  };

  const getDayName = (day) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  const playTestBeep = async () => {
    try {
      console.log('Creating AudioContext for beep test...');
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      await audioContext.resume();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      await new Promise(resolve => setTimeout(resolve, 200));
      oscillator.stop();
      console.log('Beep test completed successfully');
    } catch (error) {
      console.error('Beep test error:', error);
      alert('Error playing test beep: ' + error.message);
    }
  };

  const playTestChime = async () => {
    try {
      console.log('Creating AudioContext for chime test...');
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      await audioContext.resume();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1318.51, audioContext.currentTime); // E6
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      await new Promise(resolve => setTimeout(resolve, 1000));
      oscillator.stop();
      console.log('Chime test completed successfully');
    } catch (error) {
      console.error('Chime test error:', error);
      alert('Error playing test chime: ' + error.message);
    }
  };

  const playTestAlarm = async () => {
    try {
      console.log('Creating AudioContext for alarm test...');
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      await audioContext.resume();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const lfoOsc = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();

      // Set up alarm tone
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      
      // Set up LFO for alarm effect
      lfoOsc.type = 'square';
      lfoOsc.frequency.setValueAtTime(8, audioContext.currentTime);
      lfoGain.gain.setValueAtTime(0.5, audioContext.currentTime);

      // Connect nodes
      lfoOsc.connect(lfoGain);
      lfoGain.connect(gainNode.gain);
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

      // Start oscillators
      oscillator.start();
      lfoOsc.start();

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      oscillator.stop();
      lfoOsc.stop();
      console.log('Alarm test completed successfully');
    } catch (error) {
      console.error('Alarm test error:', error);
      alert('Error playing test alarm: ' + error.message);
    }
  };

  // Replace the old testSound function with this new version
  const testSound = async () => {
    try {
      // Try different sound types in sequence
      await playTestBeep();
      await new Promise(resolve => setTimeout(resolve, 500));
      await playTestChime();
      await new Promise(resolve => setTimeout(resolve, 500));
      await playTestAlarm();
      
      console.log('All sound tests completed successfully');
    } catch (error) {
      console.error('Sound test error:', error);
      alert('Error during sound test: ' + error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Navigation Bar */}
      <div className="w-64 p-6 border-r border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-accent/20 rounded-full transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-['Monorama']">
            Alarm Clock
          </h1>
        </div>
        <div className="space-y-4">
          <button
            onClick={testSound}
            className="w-full flex items-center gap-3 p-3 hover:bg-accent/10 rounded-lg transition-all duration-200 border border-border/50 hover:border-accent"
            title="Test Alarm Sound"
          >
            <Volume2 className="w-5 h-5 text-accent" />
            <span className="font-medium">Test Sound</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center gap-3 p-3 bg-primary/90 text-primary-foreground rounded-lg hover:bg-primary transition-colors duration-200 shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Alarm</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {alarms.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-20" />
              <h2 className="text-xl font-semibold text-muted-foreground mb-2">No Alarms Set</h2>
              <p className="text-sm text-muted-foreground mb-6">Create your first alarm to get started</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Alarm</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {alarms.map(alarm => (
                <Card 
                  key={alarm.id} 
                  className="p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/50"
                >
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleAlarm(alarm.id)}
                        className={`p-3 rounded-full transition-colors duration-200 ${
                          alarm.isActive 
                            ? 'text-primary bg-primary/10 hover:bg-primary/20' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                        }`}
                      >
                        <Bell className="w-6 h-6" />
                      </button>
                      <div>
                        <div className="text-3xl font-bold tracking-tight">
                          {alarm.time}
                        </div>
                        {alarm.label && (
                          <div className="text-sm text-muted-foreground font-medium">
                            {alarm.label}
                          </div>
                        )}
                        {alarm.days.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {alarm.days.map(day => (
                              <span
                                key={day}
                                className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground"
                              >
                                {getDayName(day)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-auto">
                      <button
                        onClick={() => deleteAlarm(alarm.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Alarm Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl w-full max-w-md shadow-xl">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Add New Alarm
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAlarm} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">Time</label>
                  <input
                    type="time"
                    value={newAlarm.time}
                    onChange={(e) => setNewAlarm({ ...newAlarm, time: e.target.value })}
                    className="w-full p-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">Label (Optional)</label>
                  <input
                    type="text"
                    value={newAlarm.label}
                    onChange={(e) => setNewAlarm({ ...newAlarm, label: e.target.value })}
                    className="w-full p-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Enter alarm label"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-muted-foreground">Repeat</label>
                  <div className="flex gap-2 justify-between">
                    {[0, 1, 2, 3, 4, 5, 6].map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setNewAlarm(prev => ({
                            ...prev,
                            days: prev.days.includes(day)
                              ? prev.days.filter(d => d !== day)
                              : [...prev.days, day]
                          }));
                        }}
                        className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                          newAlarm.days.includes(day)
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                            : 'bg-accent/10 text-accent-foreground hover:bg-accent/20'
                        }`}
                      >
                        {getDayName(day)[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                  >
                    Add Alarm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stop Alarm Modal */}
      {showStopAlarmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-card rounded-xl w-full max-w-md p-8 animate-pulse shadow-xl">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20"></div>
                <Bell className="w-20 h-20 text-primary relative animate-bounce" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Time to Wake Up!
                </h2>
                <p className="text-lg text-muted-foreground">
                  {activeAlarmId && alarms.find(a => a.id === activeAlarmId)?.label 
                    ? alarms.find(a => a.id === activeAlarmId).label 
                    : 'Your alarm is going off'}
                </p>
              </div>
              <button
                onClick={stopAlarm}
                className="w-full py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg font-bold shadow-lg shadow-primary/25"
              >
                Stop Alarm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
