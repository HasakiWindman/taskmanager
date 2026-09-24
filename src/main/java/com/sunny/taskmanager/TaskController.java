package com.sunny.taskmanager;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
@CrossOrigin(origins = "http://localhost:3000")
@RestController

public class TaskController {

    
    private final TaskRepository taskRepository;
    
    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
}
    

    
    @GetMapping("/tasks")
    public List<Task> getTasks() {
        return taskRepository.findAll();
}

    @PostMapping("/tasks")
    public Task createTask(@RequestBody Task task) {
        return taskRepository.save(task);
    }

   @PutMapping("/tasks/{id}")
    public ResponseEntity<Task> updateTask(
        @PathVariable int id,
        @RequestBody Task updatedTask) {

        Task task = taskRepository.findById(id).orElse(null);

        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        task.setTitle(updatedTask.getTitle());
        task.setCompleted(updatedTask.isCompleted());

        Task savedTask = taskRepository.save(task);

        return ResponseEntity.ok(savedTask);
    }


    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<String> deleteTask(@PathVariable int id) {

        if (!taskRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }   

        taskRepository.deleteById(id);

        return ResponseEntity.ok("Task deleted");
    }
}


    
