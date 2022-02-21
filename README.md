## merge-json-group-by-file-name-webpack-plugin

suppose you have multiple json files with the same name in different modules and you want to group the content of those files in a single file with the same name.

This is the purpose of that simple plugin

## How to use

```
{
  ....,

  plugins:[
        new MergeGroupByFileNameWebpackPlugin({
            source: './resources/js/modules/**/locales/*.json',
            dist: './resources/js/locales'
        })
  ]
}
```
