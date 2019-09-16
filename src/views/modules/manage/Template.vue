<template>
  <div class="app-container">
    <div class="filter-container">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input
            v-if="searchFlag"
            v-model="listQuery.key"
            size="mini"
            placeholder="全文搜索"
            @keyup.enter.native="onSearch" />
        </el-col>
        <el-button
          v-if="searchFlag"
          v-waves
          size="mini"
          type="primary"
          icon="el-icon-search"
          @click="onSearch">
          搜索
        </el-button>
        <el-button
          v-if="createFlag"
          size="mini"
          type="primary"
          icon="el-icon-edit"
          @click="onCreate">
          添加
        </el-button>
        <el-button
          v-if="exportFlag"
          v-waves
          :loading="exportLoading"
          size="mini"
          type="primary"
          icon="el-icon-download"
          @click="onExport">
          导出
        </el-button>
      </el-row>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%; margin-top: 20px;">
      <el-table-column
        align="center"
        label="操作"
        width="200px">
        <template slot-scope="scope">
          <el-button
            v-if="updateFlag"
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="onEdit(scope.row)">
            编辑
          </el-button>
          <el-button
            v-if="deleteFlag"
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="onDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      style="text-align: center;"
      @pagination="fetchList" />
  </div>
</template>

<script>
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { viewButtonPermission } from '@/utils/permission'

export default {
  name: 'Template',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      listLoading: false,
      exportLoading: false,
      createFlag: false,
      updateFlag: false,
      deleteFlag: false,
      exportFlag: false,
      searchFlag: true,
      listQuery: {
        page: 1,
        limit: 10,
        key: ''
      },
      list: [],
      total: 0
    }
  },
  created() {
    this.fetchList() // 获取后端数据
    viewButtonPermission(this)
  },
  methods: {
    fetchList() {
      // something
    },
    onSearch() {
      // something
    },
    onCreate() {
      // something

    },
    onExport() {
      // something
    },
    onEdit() {
      // something
    },
    onDelete() {
      // something
    }
  }
}
</script>

<style scoped>

</style>
