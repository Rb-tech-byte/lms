<?php
defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir . '/authlib.php');

/**
 * MUMIE STEM & Mathematical Single Sign-On Federation Plugin (auth_mumie)
 */
class auth_plugin_mumie extends auth_plugin_base {
    public function __construct() {
        $this->authtype = 'mumie';
        $this->config = get_config('auth_mumie');
    }

    public function user_login($username, $password) {
        global $DB;
        if ($user = $DB->get_record('user', ['username' => $username, 'mnethostid' => 1])) {
            return validate_internal_user_password($user, $password);
        }
        return false;
    }

    public function is_internal() {
        return true;
    }

    public function can_change_password() {
        return false;
    }
}

