package com.sunny.taskmanager;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://taskmanager-puce-pi.vercel.app"
})
@RestController
@RequestMapping("/tasks")
public class TaskController {
    private final TaskService tasks;
    private final JwtService jwt;

    public TaskController(TaskService tasks, JwtService jwt) {
        this.tasks = tasks;
        this.jwt = jwt;
    }

    private int userId(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")
            || authorization.length() <= 7) {
            throw new org.springframework.web.server.ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Missing token");
        }
        String token = authorization.substring(7);
        if (!jwt.isValid(token)) {
            throw new org.springframework.web.server.ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid token");
        }
        return jwt.getUserId(token);
    }

    @GetMapping
    public List<TaskResponse> getTasks(
        @RequestHeader(value = "Authorization", required = false) String authorization) {
        return tasks.list(userId(authorization));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tasks.create(userId(authorization), request));
    }

    @PutMapping("/{id}")
    public TaskResponse updateTask(
        @PathVariable int id,
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestBody TaskRequest request) {
        return tasks.update(userId(authorization), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
        @PathVariable int id,
        @RequestHeader(value = "Authorization", required = false) String authorization) {
        tasks.delete(userId(authorization), id);
        return ResponseEntity.noContent().build();
    }
}
