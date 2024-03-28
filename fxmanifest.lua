fx_version 'cerulean'
game 'gta5'

client_script 'dist/client/index.js'
server_script 'dist/server/index.js'

files {'nui/**/*', 'stream/**/*', "data/**/*", 'config.json'}

data_file 'DLC_ITYP_REQUEST' 'stream/**/*.ytyp'

--[[
    Using NUI? Uncomment the following lines to enable the NUI built from React.
]]

-- ui_page 'nui/index.html'
