import React from 'react'

function TodoItem({ todo, toggleTodo, deleteTodo }) {
  return (
    <li className="flex items-center justify-between bg-gray-100 p-4 mb-2 rounded">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => toggleTodo(todo.id)}
          className="mr-2"
        />
        <span className={todo.completed ? 'line-through text-gray-500' : ''}>
          {todo.text}
        </span>
      </div>
      <button
        onClick={() => deleteTodo(todo.id)}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
      >
        Delete
      </button>
    </li>
  )
}

export default TodoItem
