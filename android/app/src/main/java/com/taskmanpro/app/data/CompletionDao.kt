package com.taskmanpro.app.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow
import java.time.LocalDate

@Dao
interface CompletionDao {

    @Query("SELECT * FROM completions ORDER BY completedAt DESC")
    fun observeAll(): Flow<List<CompletionEntity>>

    @Query("SELECT * FROM completions ORDER BY completedAt DESC")
    suspend fun getAllOnce(): List<CompletionEntity>

    @Query("SELECT * FROM completions WHERE taskId = :taskId AND scheduledDueDate = :dueDate")
    suspend fun findByTaskAndDue(taskId: Long, dueDate: LocalDate): CompletionEntity?

    @Query("SELECT * FROM completions WHERE id = :id")
    suspend fun getById(id: Long): CompletionEntity?

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(completion: CompletionEntity): Long

    @Delete
    suspend fun delete(completion: CompletionEntity)
}
