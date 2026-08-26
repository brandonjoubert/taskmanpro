package com.taskmanpro.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.taskmanpro.app.data.TaskWithPriority
import java.time.LocalDate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskListScreen(
    viewModel: TaskViewModel,
    onAddTask: () -> Unit,
    onOpenTask: (Long) -> Unit,
    onOpenCompleted: () -> Unit,
) {
    val tasks by viewModel.activeTasks.collectAsState()
    val today = LocalDate.now()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("TaskMan Pro") },
                actions = {
                    IconButton(onClick = onOpenCompleted) {
                        Icon(Icons.Filled.History, contentDescription = "Completed tasks")
                    }
                },
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onAddTask) {
                Icon(Icons.Filled.Add, contentDescription = "Add task")
            }
        },
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            StatCards(tasks = tasks, today = today)
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(tasks, key = { it.task.id }) { item ->
                    TaskCard(item = item, today = today, onClick = { onOpenTask(item.task.id) })
                }
            }
        }
    }
}

@Composable
private fun StatCards(tasks: List<TaskWithPriority>, today: LocalDate) {
    val oneOff = tasks.count { !it.task.isRecurrent }
    val recurrent = tasks.count { it.task.isRecurrent }
    val overdue = tasks.count { it.task.dueDate < today }
    val dueThisWeek = tasks
        .filter { it.daysUntilDue in 0..7 }
        .map { it.task.title }
        .distinct()
        .size

    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        StatItem("One-off", oneOff.toString(), Modifier.weight(1f))
        StatItem("Recurrent", recurrent.toString(), Modifier.weight(1f))
        StatItem("Overdue", overdue.toString(), Modifier.weight(1f))
        StatItem("Due this week", dueThisWeek.toString(), Modifier.weight(1f))
    }
}

@Composable
private fun StatItem(label: String, value: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
    ) {
        Column(modifier = Modifier.padding(vertical = 12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(value, style = MaterialTheme.typography.titleLarge)
            Text(label, style = MaterialTheme.typography.labelSmall)
        }
    }
}

@Composable
private fun TaskCard(item: TaskWithPriority, today: LocalDate, onClick: () -> Unit) {
    val priorityColor = when {
        item.urgency >= 5 -> Color(0xFFEF4444)
        item.urgency >= 4 -> Color(0xFFF59E0B)
        item.urgency >= 2 -> Color(0xFF3B82F6)
        else -> Color(0xFF64748B)
    }
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = onClick,
        colors = CardDefaults.cardColors(
            containerColor = if (item.task.dueDate < today) Color(0xFFFDECEC) else MaterialTheme.colorScheme.surface,
        ),
    ) {
        Row(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                Text(item.task.title, style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(4.dp))
                Text(
                    text = dueLabel(item, today),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("P${item.priority}", style = MaterialTheme.typography.titleMedium, color = priorityColor)
                if (item.task.isRecurrent) {
                    Text("recurrent", style = MaterialTheme.typography.labelSmall)
                }
            }
        }
    }
}

private fun dueLabel(item: TaskWithPriority, today: LocalDate): String {
    val due = item.task.dueDate
    return when {
        due < today -> "Overdue by ${java.time.temporal.ChronoUnit.DAYS.between(due, today)}d"
        due == today -> "Due today"
        due == today.plusDays(1) -> "Due tomorrow"
        else -> "Due in ${java.time.temporal.ChronoUnit.DAYS.between(today, due)}d"
    }
}
