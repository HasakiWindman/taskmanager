package com.sunny.taskmanager;

import java.time.LocalDate;

public record TaskResponse(
    int id,
    String title,
    boolean completed,
    Priority priority,
    String category,
    LocalDate dueDate
) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(task.getId(), task.getTitle(), task.isCompleted(),
            task.getPriority() == null ? Priority.MEDIUM : task.getPriority(),
            task.getCategory() == null ? "General" : task.getCategory(),
            task.getDueDate());
    }
}
