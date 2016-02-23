var app = {
    models: {},
    collections: {},
    views: {},
    routers: {},
    proTypeIcon: {
        '变更': 'update.png',
        '项目': 'project.png',
        '团队': 'team.png'
    },
    pagesHeader: {
        list: { hash:'#addItem' , title:'创建项目' , ico:'ico-plus' , listPageTitle:'项目列表' , pageLink: '#list' },
        detail: { hash:'#addItem' , title:'创建项目' , ico:'ico-plus' , listPageTitle:'项目列表' , pageLink: '#list' },
        add: { hash:'#addItem' , title:'创建项目' , ico:'ico-plus' , listPageTitle:'项目列表' , pageLink: '#list' }
    },
    pagingNum: 20,
    currentPageCached: {
        pageName: null,
        viewTimes: 0
    }
};