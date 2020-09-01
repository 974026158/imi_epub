module.exports = {
    runtimeCompiler: true,
    pluginOptions: {
        // vconsole: { enable: true /* others... */ }
    },

    chainWebpack: config => {
        // less Loader
        config.module.rule('less').oneOf('vant').use('less-loader').loader('less-loader')
            .options({
                modifyVars: {
                    // 或者可以通过 less 文件覆盖（文件路径为绝对路径）
                    'hack': `true; @import "/epub.less";`
                }
            })
            .end()
    },

    publicPath: '/epr/'
}