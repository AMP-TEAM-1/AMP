export type Category = {
    id: number;
    text: string;
    color?: string;
};

export type Todo = {
    id: number;
    title: string;
    completed: boolean;
    categories: Category[];
    date?: string;
};