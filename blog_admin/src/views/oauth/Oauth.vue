<template>
  <el-card class="main-card">
    <div class="title">{{ this.$route.name }}</div>
    <!-- 表格操作 -->
    <div class="operation-container">
      <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="openModel(null)"
      >
        新增
      </el-button>
      <el-button
          type="danger"
          size="small"
          icon="el-icon-delete"
          :disabled="this.oauthIdList.length == 0"
          @click="isDelete = true"
      >
        批量删除
      </el-button>
      <div style="margin-left:auto">
        <el-input
            v-model="keywords"
            prefix-icon="el-icon-search"
            size="small"
            placeholder="请输入应用名"
            style="width:200px"
            @keyup.enter.native="searchOauth"
        />
        <el-button
            type="primary"
            size="small"
            icon="el-icon-search"
            style="margin-left:1rem"
            @click="searchOauth"
        >
          搜索
        </el-button>
      </div>
    </div>
    <!-- 表格展示 -->
    <el-table
        border
        :data="oauthList"
        @selection-change="selectionChange"
        v-loading="loading"
    >
      <!-- 表格列 -->
      <el-table-column type="selection" width="55" />
      <el-table-column
          type="index"
          width="50">
      </el-table-column>
      <!-- 三方登录方式 -->
      <el-table-column prop="type" label="应用名称" align="center">
        <template slot-scope="scope">
          {{ scope.row.appName }}
        </template>
      </el-table-column>
      <!-- 三方登录方式 -->
      <el-table-column prop="type" label="登录方式" align="center">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.oauthName }}</el-tag>
        </template>
      </el-table-column>
      <!--状态-->
      <el-table-column prop="enabled" label="状态" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isDisable===0" type="success">启用</el-tag>
          <el-tag v-else type="danger">禁用</el-tag>
        </template>
      </el-table-column>
      <!-- 三方登录信息创建时间 -->
      <el-table-column prop="createTime" label="创建时间" align="center">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right:5px" />
          {{ scope.row.createTime | date }}
        </template>
      </el-table-column>
      <!-- 三方登录信息创建时间 -->
      <el-table-column prop="createTime" label="修改时间" align="center">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right:5px" />
          {{ scope.row.updateTime | date }}
        </template>
      </el-table-column>
      <!-- 列操作 -->
      <el-table-column label="操作" width="160" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="openModel(scope.row)">
            编辑
          </el-button>
          <el-popconfirm
              title="确定删除吗？"
              style="margin-left:1rem"
              @confirm="deleteoauth(scope.row.id)"
          >
            <el-button size="mini" type="danger" slot="reference">
              删除
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
        class="pagination-container"
        background
        @size-change="sizeChange"
        @current-change="currentChange"
        :current-page="current"
        :page-size="size"
        :total="count"
        :page-sizes="[10, 20]"
        layout="total, sizes, prev, pager, next, jumper"
    />
    <!-- 批量删除对话框 -->
    <el-dialog :visible.sync="isDelete" width="30%">
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning" style="color:#ff9900" />提示
      </div>
      <div style="font-size:1rem">是否删除选中项？</div>
      <div slot="footer">
        <el-button @click="isDelete = false">取 消</el-button>
        <el-button type="primary" @click="deleteoauth(null)">
          确 定
        </el-button>
      </div>
    </el-dialog>
    <!-- 添加编辑对话框 -->
    <el-dialog :visible.sync="addOrEdit" width="40%">
      <div class="dialog-title-container" slot="title" ref="oauthTitle" />
      <el-form label-width="118px" size="medium" :model="oauthForm">
        <el-form-item label="应用名称" prop="name" :rules="{ required: true, message: '请输入第三方应用名' }">
          <el-input v-model="oauthForm.appName"></el-input>
        </el-form-item>
        <el-form-item label="选择登录方式" prop="type" :rules="{ required: true, message: '请选择登录方式' }">
          <el-select v-model="oauthForm.oauthName" placeholder="请选择">
            <el-option label="QQ" value="qq"></el-option>
            <el-option label="Gitee" value="gitee"></el-option>
            <el-option label="GitHub" value="github"></el-option>
            <el-option label="微博" value="weibo"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用" prop="isDisable" :rules="{ required: true, message: '请选择是否启用' }">
          <el-switch
              v-model="oauthForm.isDisable"
              :active-value="0"
              :inactive-value="1"
          ></el-switch>
        </el-form-item>
        <el-form-item label="Client ID" prop="clientId" :rules="{ required: true, message: '请输入Client ID' }">
          <el-input v-model="oauthForm.clientId"></el-input>
        </el-form-item>
        <el-form-item label="Client Secret" prop="clientSecret" :rules="{ required: true, message: '请输入Client Secret' }">
          <el-input v-model="oauthForm.clientSecret"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addOrEdit = false">取 消</el-button>
        <el-button type="primary" @click="addOrEditoauth">
          确 定
        </el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  created() {
    this.listOauth();
  },
  data: function() {
    return {
      isDelete: false,
      loading: true,
      addOrEdit: false,
      keywords: null,
      oauthIdList: [],
      oauthList: [],
      oauthForm: {
        id: null,
        type: '',
        appName: '',
        oauthName: '',
        isDisable: 0,
        clientId: '',
        clientSecret: ''
      },
      current: 1,
      size: 10,
      count: 0
    };
  },
  methods: {
    selectionChange(oauthList) {
      this.oauthIdList = [];
      oauthList.forEach(item => {
        this.oauthIdList.push(item.id);
      });
    },
    searchOauth() {
      this.current = 1;
      this.listOauth();
    },
    sizeChange(size) {
      this.size = size;
      this.listOauth();
    },
    currentChange(current) {
      this.current = current;
      this.listOauth();
    },
    deleteoauth(id) {
      var param = {};
      if (id == null) {
        param = { data: this.oauthIdList };
      } else {
        param = { data: [id] };
      }
      this.axios.delete("/api/admin/oauth", param).then(({ data }) => {
        if (data.flag) {
          this.$notify.success({
            title: "成功",
            message: data.message
          });
          this.listOauth();
        } else {
          this.$notify.error({
            title: "失败",
            message: data.message
          });
        }
        this.isDelete = false;
      });
    },
    listOauth() {
      this.axios
          .get("/api/admin/oauth", {
            params: {
              current: this.current,
              size: this.size,
              keywords: this.keywords
            }
          })
          .then(({ data }) => {
            this.oauthList = data.data.recordList;
            this.count = data.data.count;
            this.loading = false;
          });
    },
    openModel(oauth) {
      if (oauth != null) {
        this.oauthForm = JSON.parse(JSON.stringify(oauth));
        this.$refs.oauthTitle.innerHTML = "修改三方登录信息";
      } else {
        this.oauthForm.id = null;
        this.oauthForm.type = "";
        this.oauthForm.appName = "";
        this.oauthForm.oauthName = "";
        this.oauthForm.isDisable=null;
        this.oauthForm.clientId = "";
        this.oauthForm.clientSecret = "";

        this.$refs.oauthTitle.innerHTML = "添加三方登录信息";
      }
      this.addOrEdit = true;
    },
    addOrEditoauth() {
      this.axios
          .post("/api/admin/oauth", this.oauthForm)
          .then(({ data }) => {
            if (data.flag) {
              this.$notify.success({
                title: "成功",
                message: data.message
              });
              this.listOauth();
            } else {
              this.$notify.error({
                title: "失败",
                message: data.message
              });
            }
            this.addOrEdit = false;
          });
    }
  }
};
</script>
