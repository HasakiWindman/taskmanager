package com.sunny.taskmanager;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TaskServiceTest {
    private TaskRepository tasks;
    private UserRepository users;
    private TaskService service;

    @BeforeEach
    void setup() {
        tasks = mock(TaskRepository.class);
        users = mock(UserRepository.class);
        service = new TaskService(tasks, users);
    }

    @Test
    void rejectsUpdatesToOtherUsersTasks() {
        User owner = new User("owner@example.com", "hash");
        owner.setId(1);
        Task task = new Task("Private task", false);
        task.setUser(owner);
        when(tasks.findById(8)).thenReturn(Optional.of(task));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.update(2, 8, new TaskRequest("Hacked", true, Priority.HIGH, "General", null)));

        assertEquals(403, ex.getStatusCode().value());
        verify(tasks, never()).save(any());
    }

    @Test
    void rejectsBlankTitles() {
        assertThrows(ResponseStatusException.class,
            () -> service.create(1, new TaskRequest(" ", false, Priority.LOW, "General", null)));
        verify(tasks, never()).save(any());
    }

    @Test
    void onlyReturnsCurrentUsersTasks() {
        when(tasks.findByUser_Id(2)).thenReturn(java.util.List.of(new Task("Mine", false)));
        assertEquals(1, service.list(2).size());
        verify(tasks).findByUser_Id(2);
    }
}
