<template>
    <div id="head">
        <span>
            <button class="openbtn" @click="openNav">&#9776;</button> 
            <p>MyPersonalizedRoute</p> 
        </span>
        <form id="loginInfo">
            <input type="text" placeholder="Username" name="user" class="username" required>
            <input type="text" placeholder="Password" name="user" class="password" required>
            <!--   --> 
            <button type="submit" class="loginbtn"><i class="fas fa-sign-in-alt" ></i> </button>
        </form>
    </div>
</template>

<script>
export default {
    name: 'banner',
    props: {

    },
    data() {
        return {
            username: null,
            passsword: null
        }
    }, 
    methods: { 
        openNav() {
            document.getElementById("mysearch").style.width = "350px";
            document.getElementById("map-container").style.width = "79%";
        }
    }
}
</script>

<style scoped> 
#head {
    padding: 0px 0px 50px;
    width: 100%;
    height: 50px;
    background-color: #0b0c10;
    line-height: 100px;
    font-size: 20px;
    transition: margin-left .5s;
    margin-right: 0;
}

p {
    color: #eee;
    font-size: 20px;
    padding: 0px 5px;
    display:inline; 
    white-space: nowrap;
    margin-right:0px;
}

.openbtn {
    font-size: 20px;
    cursor: pointer;
    background-color: #0b0c10;
    color: #66fcf1;
    border: none;
    margin: 0px;
}

/* input field */
.username {
    position:fixed;
    top:5px;
    right:16%;
    margin-right: 2px;
    font-size: 16px;
    white-space: nowrap;
    margin-top:35px;
    overflow:hidden;
}

.password {
    position:fixed;
    top:5px;
    right:4%;
    font-size: 16px;
    white-space: nowrap;
    margin-top:35px;
    margin-left: 1px;
    overflow:hidden;
}

.loginbtn {
    position: fixed;
    top:5px;
    right:2.5%;
    color:#66fcf1;
    font-size: 16px;
    background: #1f2833;
    padding: 2px 4px 2px 2px;
    border:none;
    cursor: pointer;
    margin-top:35px;
}

.loginbtn:hover {
    background: #45a29e;
}
</style>

