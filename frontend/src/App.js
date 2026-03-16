import React, { useState } from 'react';
import { useFreighter } from './hooks/useFreighter';
import { addTask } from './services/soroban';
import { CheckCircle2, Plus, Wallet, AlertCircle, Loader2 } from 'lucide-react';
import './index.css';

function App() {
  const { pubKey, connect, error: walletError } = useFreighter();
  const [taskText, setTaskText] = useState("");
  const [tasks, setTasks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txError, setTxError] = useState("");
  const [txSuccess, setTxSuccess] = useState("");

  const handleConnect = async () => {
    await connect();
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    
    setIsSubmitting(true);
    setTxError("");
    setTxSuccess("");

    try {
      // 1. Send transaction to Soroban network via Freighter wallet signature
      console.log("Adding task on chain...");
      await addTask(pubKey, taskText);
      
      // 2. Optimistically update UI if transaction succeeds
      const newTask = {
        id: Date.now(), // Fake ID for optimistic UI since we don't return ID from tx right now
        description: taskText,
        completed: false
      };
      setTasks([...tasks, newTask]);
      setTaskText("");
      setTxSuccess("Successfully added task to the blockchain!");
    } catch (err) {
      console.error(err);
      setTxError(err.message || "Failed to add task. Please check your wallet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const markDone = (id) => {
    // In a full implementation, this should also send a transaction to the network.
    // For now, we update the optimistic UI state.
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: true } : t));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-10 bg-gray-900/50 backdrop-blur-md border-b border-white/5 py-4 px-6 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Soroban Checklist
          </h1>
        </div>
        
        {pubKey ? (
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">
              {pubKey.substring(0, 4)}...{pubKey.substring(pubKey.length - 4)}
            </span>
          </div>
        ) : (
          <button 
            onClick={handleConnect}
            className="group relative px-5 py-2.5 bg-white text-black font-medium rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            <span className="flex items-center gap-2 group-hover:text-white transition-colors z-10 relative">
              <Wallet className="w-4 h-4" /> Connect Wallet
            </span>
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-24 mb-12 max-w-2xl w-full mx-auto px-6 flex flex-col">
        
        {/* Wallet Connection Errors */}
        {walletError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{walletError}</p>
          </div>
        )}

        {/* Transaction Status Alerts */}
        {txError && (
           <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
             <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
             <p className="text-sm font-medium">{txError}</p>
           </div>
        )}

        {txSuccess && (
           <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
             <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
             <p className="text-sm font-medium">{txSuccess}</p>
           </div>
        )}

        {/* State: Not Connected */}
        {!pubKey ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center mt-20 opacity-80">
            <div className="w-24 h-24 mb-6 rounded-3xl bg-gray-800/50 flex items-center justify-center border border-white/5 ring-1 ring-white/10 ring-offset-8 ring-offset-gray-950">
              <Wallet className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Connect your Wallet</h2>
            <p className="text-gray-400 max-w-md mb-8">
              Please connect your Freighter wallet to interact with the Soroban smart contract and start managing your decentralized checklist.
            </p>
            <button 
              onClick={handleConnect}
              className="px-8 py-3 bg-white text-black font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Connect Freighter
            </button>
          </div>
        ) : (
          /* State: Connected */
          <div className="flex flex-col animate-in fade-in duration-500">
            
            {/* Input Form */}
            <form onSubmit={handleAddTask} className="mb-8 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative flex bg-gray-900 border border-white/10 rounded-2xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
                <input
                  type="text"
                  placeholder="What needs to be done on-chain?"
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 bg-transparent px-6 py-4 outline-none text-white placeholder:text-gray-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!taskText.trim() || isSubmitting}
                  className="px-6 py-4 bg-emerald-500 text-white font-medium flex items-center gap-2 hover:bg-emerald-400 disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Adding...</>
                  ) : (
                    <><Plus className="w-5 h-5" /> Add Task</>
                  )}
                </button>
              </div>
            </form>

            {/* Task List */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 px-2">
                Your Checklist ({tasks.length})
              </h3>
              
              {tasks.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-white/10 text-gray-500">
                  <p>No tasks found. Add one above to store it on the Stellar network.</p>
                </div>
              ) : (
                tasks.map((task, idx) => (
                  <div 
                    key={task.id}
                    className="group flex items-center justify-between p-4 bg-gray-900/50 border border-white/5 rounded-2xl hover:border-white/10 transition-all hover:shadow-lg animate-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => markDone(task.id)}
                        disabled={task.completed}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          task.completed 
                            ? "bg-emerald-500 border-emerald-500 text-white" 
                            : "border-gray-600 hover:border-emerald-500 focus:outline-none"
                        }`}
                      >
                         {task.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <span className={`text-lg transition-all ${task.completed ? "text-gray-500 line-through" : "text-gray-200"}`}>
                        {task.description}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
