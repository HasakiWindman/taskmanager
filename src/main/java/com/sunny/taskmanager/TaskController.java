package com.sunny.taskmanager;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestHeader;
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://taskmanager-puce-pi.vercel.app"
})
@RestController

public class TaskController { 
    private final TaskRepository taskRepository;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    public TaskController(TaskRepository taskRepository, JwtService jwtService, UserRepository userRepository) {

        this.taskRepository = taskRepository;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
}

    @GetMapping("/tasks")
public ResponseEntity<?> getTasks(
    @RequestHeader(value = "Authorization", required = false) String authHeader)  {
        if (authHeader == null || !authHeader.startsWith("Bearer ")
        || authHeader.length() <= 7) {
        return ResponseEntity.status(401).body("Missing token");
}       
 
        String token = authHeader.substring(7);

        if (!jwtService.isValid(token)) {
        return ResponseEntity.status(401).body("Invalid token");
    }
        Integer userId = jwtService.getUserId(token);
        return ResponseEntity.ok(taskRepository.findByUser_Id(userId));
}

    
  

    @PostMapping("/tasks")
    public ResponseEntity<?> createTask(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestBody Task task) {
            
    if (authHeader == null || !authHeader.startsWith("Bearer ")
        || authHeader.length() <= 7) {
    return ResponseEntity.status(401).body("Missing token");
}        
    String token = authHeader.substring(7);

    if (!jwtService.isValid(token)) {
        return ResponseEntity.status(401).body("Invalid token");
    }
    Integer userId = jwtService.getUserId(token);
    User user = userRepository.findById(userId).orElse(null);

    if (user == null) {
        return ResponseEntity.status(401).body("User not found");
    }
    task.setUser(user);
    return ResponseEntity.ok(taskRepository.save(task));
}


   @PutMapping("/tasks/{id}")
    public ResponseEntity<?> updateTask(
            @PathVariable Integer id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Task updatedTask) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")
        || authHeader.length() <= 7) {
        return ResponseEntity.status(401).body("Missing token");
}
        String token = authHeader.substring(7);

        if (!jwtService.isValid(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        Integer userId = jwtService.getUserId(token);
        Task task = taskRepository.findById(id).orElse(null);

        if (task == null) {
            return ResponseEntity.notFound().build();
        }
        if (!task.getUser().getId().equals(userId)) {
            return ResponseEntity.status(403).body("Not your task");
        }
        task.setTitle(updatedTask.getTitle());
        task.setCompleted(updatedTask.isCompleted());

        return ResponseEntity.ok(taskRepository.save(task));
    }
    

        @DeleteMapping("/tasks/{id}")
    public ResponseEntity<?> deleteTask(
            @PathVariable Integer id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
                
        if (authHeader == null || !authHeader.startsWith("Bearer ")
        || authHeader.length() <= 7) {
            return ResponseEntity.status(401).body("Missing token");
}
        String token = authHeader.substring(7);

        if (!jwtService.isValid(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        Integer userId = jwtService.getUserId(token);
        Task task = taskRepository.findById(id).orElse(null);

        if (task == null) {
            return ResponseEntity.notFound().build();
        }
        if (!task.getUser().getId().equals(userId)) {
            return ResponseEntity.status(403).body("Not your task");
        }
        taskRepository.delete(task);

        return ResponseEntity.ok("Deleted");
    }
    }


        
