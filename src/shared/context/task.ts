import { createContext } from 'react';

const TaskContext = createContext<string | null>(null);

export default TaskContext;
