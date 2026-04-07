import React, { useState } from 'react';

const ReminderScheduler = () => {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    name: '',
    time: '',
    frequency: 'daily',
  });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReminder((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleReminder = (e) => {
    e.preventDefault();
    if (!newReminder.name || !newReminder.time) {
      setMessage('Please fill in all fields.');
      return;
    }

    // Placeholder for actual scheduling logic (Obj 11)
    const reminderId = Date.now();
    const reminderWithId = { ...newReminder, id: reminderId };

    // In a real app, this would call a service worker or a local notification API
    // await scheduleReminder(reminderWithId); 

    setReminders((prev) => [...prev, reminderWithId]);
    setNewReminder({ name: '', time: '', frequency: 'daily' });
    setMessage(`Reminder for "${newReminder.name}" scheduled successfully!`);
  };

  const handleDeleteReminder = (id) => {
    // Placeholder for actual deletion logic
    setReminders((prev) => prev.filter(r => r.id !== id));
    setMessage('Reminder deleted.');
  };

  return (
    <div className="reminder-scheduler-container">
      <h2>Offline Medicine Reminder Scheduler (Obj 11)</h2>

      <form onSubmit={handleScheduleReminder} className="reminder-form">
        <input
          type="text"
          name="name"
          value={newReminder.name}
          onChange={handleInputChange}
          placeholder="Medicine Name / Task"
          required
        />
        <input
          type="time"
          name="time"
          value={newReminder.time}
          onChange={handleInputChange}
          required
        />
        <select name="frequency" value={newReminder.frequency} onChange={handleInputChange}>
          <option value="daily">Daily</option>
          <option value="once">Once</option>
          <option value="weekly">Weekly</option>
        </select>
        <button type="submit">Schedule Reminder</button>
      </form>

      {message && <p className="status-message">{message}</p>}

      <h3>Active Reminders</h3>
      {reminders.length === 0 ? (
        <p>No reminders set. Schedule your first one!</p>
      ) : (
        <ul className="reminders-list">
          {reminders.map((reminder) => (
            <li key={reminder.id}>
              <span>{reminder.name} at {reminder.time} ({reminder.frequency})</span>
              <button onClick={() => handleDeleteReminder(reminder.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReminderScheduler;