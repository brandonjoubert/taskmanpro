package com.taskmanpro.app.ui

import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.taskmanpro.app.data.AppDatabase
import com.taskmanpro.app.data.TaskRepository

@Composable
fun TaskApp(db: AppDatabase) {
    val repository = TaskRepository(db.taskDao(), db.completionDao())
    val viewModel: TaskViewModel = viewModel { TaskViewModel(repository) }
    TaskAppNavHost(viewModel)
}

@Composable
fun TaskAppNavHost(viewModel: TaskViewModel) {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "tasks") {
        composable("tasks") {
            TaskListScreen(
                viewModel = viewModel,
                onAddTask = { navController.navigate("edit/new") },
                onOpenTask = { id -> navController.navigate("task/$id") },
                onOpenCompleted = { navController.navigate("completed") },
            )
        }
        composable("completed") {
            CompletedScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() },
            )
        }
        composable(
            route = "edit/{taskId}",
            arguments = listOf(navArgument("taskId") { type = NavType.StringType }),
        ) { backStackEntry ->
            val taskId = backStackEntry.arguments?.getString("taskId") ?: "new"
            TaskEditScreen(
                viewModel = viewModel,
                taskId = taskId,
                onDone = { navController.popBackStack() },
            )
        }
        composable(
            route = "task/{taskId}",
            arguments = listOf(navArgument("taskId") { type = NavType.LongType }),
        ) { backStackEntry ->
            val taskId = backStackEntry.arguments?.getLong("taskId") ?: return@composable
            TaskDetailScreen(
                viewModel = viewModel,
                taskId = taskId,
                onBack = { navController.popBackStack() },
                onEdit = { navController.navigate("edit/$taskId") },
            )
        }
    }
}
