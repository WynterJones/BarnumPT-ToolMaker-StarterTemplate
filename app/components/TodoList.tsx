'use client';

import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Confetti from './Confetti';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'completed';
type FilterOption = 'all' | 'completed';

export default function TodoList() {
  const [todos, setTodos, isLoaded] = useLocalStorage<Todo[]>('todos', []);
  const [inputValue, setInputValue] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  const addTodo = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue === '') return;

    const newTodo: Todo = {
      id: `${Date.now()}-${Math.random()}`,
      text: trimmedValue,
      completed: false,
      createdAt: Date.now(),
    };

    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    setAnimatingIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      const updatedTodos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      setTodos(updatedTodos);

      // Check if all todos are completed
      const allCompleted = updatedTodos.length > 0 && updatedTodos.every(t => t.completed);
      if (allCompleted) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 100);
      }

      setAnimatingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  const deleteTodo = (id: string) => {
    setAnimatingIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      setTodos(todos.filter(todo => todo.id !== id));
    }, 400);
  };

  const clearCompleted = () => {
    const completedIds = todos.filter(t => t.completed).map(t => t.id);
    completedIds.forEach(id => setAnimatingIds(prev => new Set(prev).add(id)));
    setTimeout(() => {
      setTodos(todos.filter(todo => !todo.completed));
    }, 400);
  };

  const getSortedTodos = () => {
    const sorted = [...todos];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
      case 'oldest':
        return sorted.sort((a, b) => a.createdAt - b.createdAt);
      case 'alphabetical':
        return sorted.sort((a, b) => a.text.localeCompare(b.text));
      case 'completed':
        return sorted.sort((a, b) => {
          if (a.completed === b.completed) return b.createdAt - a.createdAt;
          return a.completed ? 1 : -1;
        });
      default:
        return sorted;
    }
  };

  const getFilteredTodos = () => {
    const sorted = getSortedTodos();
    switch (filterBy) {
      case 'completed':
        return sorted.filter(todo => todo.completed);
      default:
        return sorted;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const filteredTodos = getFilteredTodos();
  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  return (
    <>
      <Confetti show={showConfetti} />
      <div className="mx-auto w-full max-w-4xl p-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div
            className="transform rounded-2xl border-2 border-black bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            role="status"
            aria-label={`${activeCount} active tasks`}
          >
            <div className="text-3xl font-bold text-black">{activeCount}</div>
            <div className="text-sm font-medium text-gray-700">Active Tasks</div>
          </div>
          <div
            className="transform rounded-2xl border-2 border-black bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            role="status"
            aria-label={`${completedCount} completed tasks`}
          >
            <div className="text-3xl font-bold text-black">{completedCount}</div>
            <div className="text-sm font-medium text-gray-700">Completed</div>
          </div>
        </div>

        {/* Input */}
        <div className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What needs to be done?"
              aria-label="New todo item"
              className="flex-1 rounded-2xl border-2 border-black bg-white px-6 py-4 text-lg text-black transition-all duration-200 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-4 focus:ring-gray-200"
            />
            <button
              onClick={addTodo}
              disabled={!inputValue.trim()}
              aria-label="Add todo"
              className="transform rounded-2xl border-2 border-black bg-black px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-800 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              Add
            </button>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex gap-2 rounded-2xl border-2 border-black bg-white p-1" role="group" aria-label="Filter todos">
            {(['all', 'completed'] as FilterOption[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterBy(filter)}
                aria-pressed={filterBy === filter}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  filterBy === filter
                    ? 'bg-black text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-black'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Sort todos"
            className="rounded-2xl border-2 border-black bg-white px-4 py-2 text-sm font-medium text-black transition-all duration-200 hover:border-gray-700 focus:border-black focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">A-Z</option>
            <option value="completed">Active First</option>
          </select>

          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              aria-label={`Clear ${completedCount} completed tasks`}
              className="ml-auto rounded-2xl border-2 border-black bg-white px-4 py-2 text-sm font-medium text-black transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
            >
              Clear Completed
            </button>
          )}
        </div>

        {/* Todo List */}
        <div className="space-y-3" role="list" aria-label="Todo items">
          {filteredTodos.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <div className="mb-2 text-6xl" aria-hidden="true">✨</div>
              <div className="text-lg font-medium text-gray-500">
                {filterBy === 'completed'
                  ? 'No completed tasks yet'
                  : 'No tasks yet. Add one to get started!'}
              </div>
            </div>
          ) : (
            filteredTodos.map((todo, index) => (
              <div
                key={todo.id}
                role="listitem"
                className={`group transform transition-all duration-400 ${
                  animatingIds.has(todo.id) ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                }`}
                style={{
                  animationName: 'slideIn',
                  animationDuration: '0.4s',
                  animationTimingFunction: 'ease-out',
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className={`flex items-center gap-4 rounded-2xl border-2 p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                  todo.completed
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-black bg-white'
                }`}>
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    aria-pressed={todo.completed}
                    className={`h-8 w-8 flex-shrink-0 rounded-full border-2 transition-all duration-300 ${
                      todo.completed
                        ? 'scale-110 border-black bg-black'
                        : 'border-gray-400 bg-white hover:border-black'
                    }`}
                  >
                    {todo.completed && (
                      <svg className="h-full w-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <span
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex-1 cursor-pointer text-lg transition-all duration-300 ${
                      todo.completed
                        ? 'text-gray-400 line-through'
                        : 'text-black'
                    }`}
                  >
                    {todo.text}
                  </span>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    aria-label={`Delete ${todo.text}`}
                    className="flex-shrink-0 rounded-full p-2 text-gray-400 opacity-0 transition-all duration-200 hover:bg-gray-200 hover:text-black group-hover:opacity-100"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <style jsx>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </>
  );
}
