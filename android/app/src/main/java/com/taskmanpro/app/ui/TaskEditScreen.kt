package com.taskmanpro.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.taskmanpro.app.data.TaskWithPriority

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskEditScreen(
    viewModel: TaskViewModel,
    taskId: String,
    onDone: () -> Unit,
) {
    val isNew = taskId == "new"
    val tasks by viewModel.activeTasks.collectAsState()
    val existing: TaskWithPriority? = if (!isNew) {
        val id = taskId.toLongOrNull()
        var found: TaskWithPriority? = null
        if (id != null) {
            for (t in tasks) {
                if (t.task.id == id) {
                    found = t
                    break
                }
            }
        }
        found
    } else null

    var title by remember { mutableStateOf(existing?.task?.title ?: "") }
    var description by remember { mutableStateOf(existing?.task?.description ?: "") }
    var dueDate by remember { mutableStateOf(existing?.task?.dueDate?.toString() ?: "") }
    var importance by remember { mutableStateOf(existing?.task?.importance?.toString() ?: "3") }
    var risk by remember { mutableStateOf(existing?.task?.risk?.toString() ?: "3") }
    var isRecurrent by remember { mutableStateOf(existing?.task?.isRecurrent ?: false) }
    var recurrenceInterval by remember {
        mutableStateOf(existing?.task?.recurrenceInterval?.takeIf { it > 0 }?.toString() ?: "7")
    }
    var errors by remember { mutableStateOf(emptyMap<String, String>()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (isNew) "Add Task" else "Edit Task") },
                navigationIcon = {
                    IconButton(onClick = onDone) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("Title") },
                isError = errors.containsKey("title"),
                supportingText = errors["title"]?.let { { Text(it) } },
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Description / Notes") },
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = dueDate,
                onValueChange = { dueDate = it },
                label = { Text("Due date (YYYY-MM-DD)") },
                isError = errors.containsKey("dueDate"),
                supportingText = errors["dueDate"]?.let { { Text(it) } },
                modifier = Modifier.fillMaxWidth(),
            )
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = importance,
                    onValueChange = { importance = it },
                    label = { Text("Importance (1-5)") },
                    isError = errors.containsKey("importance"),
                    supportingText = errors["importance"]?.let { { Text(it) } },
                    modifier = Modifier.weight(1f),
                )
                OutlinedTextField(
                    value = risk,
                    onValueChange = { risk = it },
                    label = { Text("Risk (1-5)") },
                    isError = errors.containsKey("risk"),
                    supportingText = errors["risk"]?.let { { Text(it) } },
                    modifier = Modifier.weight(1f),
                )
            }
            Card {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Recurrent", style = MaterialTheme.typography.titleMedium)
                        Text("Repeats every N days", style = MaterialTheme.typography.bodySmall)
                    }
                    Switch(checked = isRecurrent, onCheckedChange = { isRecurrent = it })
                }
            }
            if (isRecurrent) {
                OutlinedTextField(
                    value = recurrenceInterval,
                    onValueChange = { recurrenceInterval = it },
                    label = { Text("Recurrence interval (days)") },
                    isError = errors.containsKey("recurrenceInterval"),
                    supportingText = errors["recurrenceInterval"]?.let { { Text(it) } },
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            Button(
                onClick = {
                    val callback: (com.taskmanpro.app.domain.ValidationResult) -> Unit = { result ->
                        if (result.isValid) {
                            onDone()
                        } else {
                            errors = result.errors
                        }
                    }
                    if (isNew) {
                        viewModel.create(title, description, dueDate, importance, risk, isRecurrent, recurrenceInterval, callback)
                    } else {
                        viewModel.update(taskId.toLong(), title, description, dueDate, importance, risk, isRecurrent, recurrenceInterval, callback)
                    }                },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(if (isNew) "Save Task" else "Save Changes")
            }
        }
    }
}
