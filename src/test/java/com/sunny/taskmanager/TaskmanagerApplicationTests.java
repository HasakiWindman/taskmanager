package com.sunny.taskmanager;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TaskResponseTest {
    @Test
    void mapsLegacyTaskDefaults() {
        Task task = new Task("Prepare interviews", false);
        task.setPriority(null);
        task.setCategory(null);
        task.setDueDate(LocalDate.of(2026, 11, 5));
        TaskResponse result = TaskResponse.from(task);
        assertEquals("Prepare interviews", result.title());
        assertEquals(Priority.MEDIUM, result.priority());
        assertEquals("General", result.category());
        assertEquals(LocalDate.of(2026, 11, 5), result.dueDate());
    }
}
