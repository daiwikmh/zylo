"use client";

import { useState } from 'react';

interface TodoItem {
  id: string;
  title: string;
  meta: string;
  completed: boolean;
}

const initialTodos: TodoItem[] = [
  { id: '1', title: 'Run payroll', meta: 'Mar 4 at 6:00 pm', completed: true },
  { id: '2', title: 'Review time off request', meta: 'Mar 7 at 6:00 pm', completed: false },
  { id: '3', title: 'Sign board resolution', meta: 'Mar 12 at 6:00 pm', completed: false },
  { id: '4', title: 'Finish onboarding Tony', meta: 'Mar 12 at 6:00 pm', completed: false },
];

export const TodoListWidget = () => {
  const [todos, setTodos] = useState(initialTodos);

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="todo-widget">
      <h3 className="todo-widget-header">Your to-Do list</h3>
      <div className="todo-list">
        {todos.map((todo) => (
          <div key={todo.id} className="todo-item">
            <div
              className={`todo-checkbox ${todo.completed ? 'completed' : ''}`}
              onClick={() => toggleTodo(todo.id)}
            />
            <div className="todo-content">
              <div className={`todo-title ${todo.completed ? 'completed' : ''}`}>
                {todo.title}
              </div>
              <div className="todo-meta">{todo.meta}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Meeting Card */}
      <div className="meeting-card">
        <div className="meeting-date">Feb 22 at 6:00 PM</div>
        <h4 className="meeting-title">Board meeting</h4>
        <p className="meeting-description">
          You have been invited to attend a meeting of the Directors.
        </p>
      </div>
    </div>
  );
};

export default TodoListWidget;
