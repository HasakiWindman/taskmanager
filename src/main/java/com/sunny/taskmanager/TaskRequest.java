package com.sunny.taskmanager;

import java.time.LocalDate;

public record TaskRequest(
    String title,
    boolean completed,
    Priority priority,
    String category,
    LocalDate dueDate
) {}
