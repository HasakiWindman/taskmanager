package com.sunny.taskmanager;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TaskService {
    private final TaskRepository tasks;
    private final UserRepository users;

    public TaskService(TaskRepository tasks, UserRepository users) {
        this.tasks = tasks;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> list(int userId) {
        return tasks.findByUser_Id(userId).stream().map(TaskResponse::from).toList();
    }

    @Transactional
    public TaskResponse create(int userId, TaskRequest request) {
        Task task = new Task();
        apply(task, request);
        User owner = users.findById(userId).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        task.setUser(owner);
        return TaskResponse.from(tasks.save(task));
    }

    @Transactional
    public TaskResponse update(int userId, int taskId, TaskRequest request) {
        Task task = ownedTask(userId, taskId);
        apply(task, request);
        return TaskResponse.from(tasks.save(task));
    }

    @Transactional
    public void delete(int userId, int taskId) {
        tasks.delete(ownedTask(userId, taskId));
    }

    private Task ownedTask(int userId, int taskId) {
        Task task = tasks.findById(taskId).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        if (task.getUser() == null || !task.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your task");
        }
        return task;
    }

    private void apply(Task task, TaskRequest request) {
        String title = request.title() == null ? "" : request.title().trim();
        if (title.isEmpty() || title.length() > 200) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Title must be between 1 and 200 characters");
        }
        String category = request.category() == null || request.category().isBlank()
            ? "General" : request.category().trim();
        if (category.length() > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Category must be 50 characters or less");
        }
        task.setTitle(title);
        task.setCompleted(request.completed());
        task.setPriority(request.priority() == null ? Priority.MEDIUM : request.priority());
        task.setCategory(category);
        task.setDueDate(request.dueDate());
    }
}
