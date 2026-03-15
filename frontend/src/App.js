import React, { useState } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([
    { id: 1, description: 'Learn Soroban', is_done: true },
    { id: 2, description: 'Build Checklist Contract', is_done: true },
    { id: 3, description: 'Deploy to Testnet', is_done: false },
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    // In a real app, this would call `add_task` on the smart contract
    const task = {
      id: tasks.length + 1,
      description: newTask,
      is_done: false,
    };
    
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const markDone = (id) => {
    // In a real app, this would call `mark_done` on the smart contract
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, is_done: true } : t
    ));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Soroban Checklist DApp</h1>
        <p>A basic Stellar smart contract to-do list.</p>
      </header>
      
      <main className="App-main">
        <form onSubmit={addTask} className="task-form">
          <input 
            type="text" 
            value={newTask} 
            onChange={e => setNewTask(e.target.value)} 
            placeholder="Add a new task..."
          />
          <button type="submit">Add Task</button>
        </form>

        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className={task.is_done ? 'done' : ''}>
              <span>{task.description}</span>
              {!task.is_done && (
                <button onClick={() => markDone(task.id)}>Mark Done</button>
               )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default App;
