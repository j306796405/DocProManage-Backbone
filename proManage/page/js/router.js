(function(w,$){
    app.routers.AppRouter = Backbone.Router.extend({
        pageNameCache: 'list',
        routes : {
            ''  :  'list',
            'list'  :  'list',
            'list/:currentPage'  :  'listPaging',
            'item/:id'  :  'detail',
            'addItem'  :  'add',
            'report'  :  'report'
        },
        initialize: function(){
            /*this.route(/./, "changeHeader", function(number){

             });*/
        },
        currentView: null,
        changeView: function(view){
            if(null != this.currentView){
                this.currentView.undelegateEvents();
            }
            this.currentView = view;
            this.currentView.render();
        },
        // 列表页
        list : function(){
            this.pageNameCache = 'list';
            if(!app.views.listHeaderView){
                app.views.listHeaderView = new app.views.HeaderView({model: app.pagesHeader.list}).render();
            }else{
                app.views.listHeaderView.render();
            }

            app.collections.listCollection.fetch({
                data: {keyword: app.models.pagingModel.get('keyword'), currentPage: 1, pageSize: app.pagingNum},
                success: function (collection, res) {
                    if(! app.views.listView){
                        app.views.listView = new app.views.ListView({collection: collection, model: app.models.pagingModel}).render();
                    }else{
                        app.models.pagingModel.set({page: 1});
                        app.views.listView.render();
                        app.views.listDataView.render();
                        app.views.pagingView.render();
                    }
                    //app.views.listView = new app.views.ListView({collection: collection}).render();
                }
            });
        },
        // 列表页
        listPaging : function(currentPage){
            var _this = this;
            if(!app.views.listHeaderView){
                app.views.listHeaderView = new app.views.HeaderView({model: app.pagesHeader.list}).render();
            }else{
                app.views.listHeaderView.render();
            }

            app.models.pagingModel.set('page',currentPage);
            app.collections.listCollection.fetch({
                data: {keyword: app.models.pagingModel.get('keyword'), currentPage: currentPage, pageSize: app.pagingNum},
                success: function (collection, res) {
                    if(!app.views.listView){
                        app.views.listView = new app.views.ListView({collection: collection, model: app.models.pagingModel}).render();
                    }else if(_this.pageNameCache != 'list'){
                        app.views.listView.render();
                        app.views.listDataView.render();
                        app.views.pagingView.render();
                        _this.pageNameCache = 'list';
                    }else{
                        app.views.listDataView.render();
                    }
                }
            });
        },
        // 详情页
        detail : function(id){
            var _this = this;
            this.pageNameCache = 'detail';
            if(!app.views.detailHeaderView){
                app.views.detailHeaderView = new app.views.HeaderView({model: app.pagesHeader.detail}).render();
            }else{
                app.views.detailHeaderView.render();
            }

            if(!this.model){
                this.model = new app.models.ItemModel({id: id});
            }
            this.model.set({id: id});

            this.model.fetch({
                success:function(model,response){
                    /*if(app.views.detailView){
                        app.views.detailView.render();
                    }else{
                        app.views.detailView = new app.views.DetailView({model: model}).render();
                    }*/
                    _this.changeView(new app.views.DetailView({model: model}));
                }
            })
        },
        // 填写页
        add :  function(){
            this.pageNameCache = 'add';
            if(!app.views.addHeaderView){
                app.views.addHeaderView = new app.views.HeaderView({model: app.pagesHeader.add}).render();
            }else{
                app.views.addHeaderView.render();
            }

            if(app.views.addView){
                app.views.addView.render();
            }else{
                app.views.addView  = new app.views.AddView().render();
            }
        },
        //eachrts报表
        report: function(){
            this.pageNameCache = 'report';
            if(!app.views.addHeaderView){
                app.views.addHeaderView = new app.views.HeaderView({model: app.pagesHeader.add}).render();
            }else{
                app.views.addHeaderView.render();
            }

            if(app.views.reportView){
                app.views.reportView.render();
            }else{
                app.views.reportView  = new app.views.ReportView().render();
            }
        }
    })

})(window,jQuery);

