<!-- PHP Wrapper - 500 Server Error -->
<!DOCTYPE html>
<html lang="en">
<head>

    <meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <meta name="handheldfriendly" content="true" />
    <meta name="mobileoptimized"  content="width" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Better Things Financial Partners is a chartered retirement planning service provider, located in Lexington, South Carolina." />
    <meta name="keywords" content="Chip Estes, chartered retirement planning counselor, financial planning, retirement planning, financial strategies, retirement plans, financial planner, retirement services, CRPC, FINRA, Lexington South Carolina" />
    <meta name="author" content="Chip Estes" />

    <title>Better Things Financial Partners, LLC</title>

    <!-- Page specific css, or css required before script loading -->
    <style>
        #body {
            display: block;
        }

        #no_javascript {
            text-align: center;
            color: #999;
        }

		#jumbotron_h1 {
			margin-top: 0.2em;
			margin-bottom: 1.5em;
		}

		#jumbotron_h1.financial {
			color: #FFF;
			text-shadow: 4px 4px 2px rgba(0, 0, 0, 1);
		}

		#jumbotron_div {
			margin-bottom: 0.5em;
		}

		/*==================================================
		=            Bootstrap 3 Media Queries             =
		==================================================*/
	
		/*==========  Default css (sizing, etc.)  ==========*/
	
		.jumbotron {
			background-image: url("http://betterthingsfp.com/images/sized/1920/calm_sunrise.jpg");
		}
	
		/*==========  Non-Mobile First Method  ==========*/
	
		/* Large Devices, Wide Screens */
		@media only screen and (max-width : 1200px) {
	
			.jumbotron {
				background-image: url("http://betterthingsfp.com/images/sized/1280/calm_sunrise.jpg");
			}
		}
	
		/* Medium Devices, Desktops */
		@media only screen and (max-width : 992px) {
	
			.jumbotron {
				background-image: url("http://betterthingsfp.com/images/sized/960/calm_sunrise.jpg");
			}
		}
	
		/* Small Devices, Tablets */
		@media only screen and (max-width : 768px) {
	
			.jumbotron {
				background-image: url("http://betterthingsfp.com/images/sized/640/calm_sunrise.jpg");
			}
		}
	
		/* Extra Small Devices, Phones */ 
		@media only screen and (max-width : 480px) {
	
			.jumbotron {
				background-image: url("http://betterthingsfp.com/images/sized/480/calm_sunrise.jpg");
			}
		}
	
		/* Custom, iPhone Retina */ 
		@media only screen and (max-width : 320px) {
	
			.jumbotron {
				background-image: url("http://betterthingsfp.com/images/sized/320/calm_sunrise.jpg");
			}
		}

    </style>

		<link rel="stylesheet" href="http://betterthingsfp.com/css/bootstrap/v331_wo_icons.min.css" />
		<link rel="stylesheet" href="http://betterthingsfp.com/css/bootstrap/v331_theme.min.css" />
		<link rel="stylesheet" href="http://betterthingsfp.com/css/betterthings.css" />

</head>
<body>

    <noscript>
        <h3 id="no_javascript">We're sorry, but this site requires JavaScript be enabled!</h3>
    </noscript>

    <div id="body">

        <!-- Fixed navbar -->
        <nav class="navbar navbar-default navbar-fixed-top">
            <div class="container">
                <div class="navbar-header">
                    <a class="navbar-brand" href="#">Better Things Financial Partners</a>
                </div>
                <div id="navbar" class="navbar-collapse collapse">
                    <ul class="nav navbar-nav">
                        <li><a href="http://betterthingsfp.com/index.html"><i class="fa fa-home"></i> Home</a></li>
						<li><a href="http://betterthingsfp.com/contact.html"><i class="fa fa-phone"></i> Contact</a></li>
                    </ul>
                </div><!--/.nav-collapse -->
            </div>
        </nav>

        <!--[if lt IE 8]>
        <p id="old_browser">
            You are using an <strong>outdated</strong> browser. Please
            <a href="http://browsehappy.com/">upgrade your browser</a>
            to improve your experience.
        </p>
        <![endif]-->

        <!-- Main jumbotron for a primary marketing message or call to action -->
        <div class="jumbotron">
            <div class="container">
                <h1 id="jumbotron_h1">Better Things <span class="no_wrap shorten">Financial Partners</span> (Server Error)</h1>

				<div id="jumbotron_div">
                    We are sorry you are experiencing technical problems. Please feel free to contact us
                    about the problem(s), if you feel they were cause by our website or software.
                </div>

            </div>
        </div>
		<div class="shadow top"></div>

        <div id="page_content" class="container">
            <!-- Example row of columns -->

            <h2>Error 500: Server Error</h2>

            <h3>Page or URI Requested: <!--#echo var="HTTP_HOST" --><!--#echo var="REQUEST_URI" --></h3>

            <div class="well">
                A misconfiguration on the server caused a hiccup. Please let us know if this is
                a reoccurring issue. An Admin will need to check the server if the problem continues.
            </div>

            <h3>
            <?
              echo "URL: http://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']."<br>\n";
              $fixer = "checksuexec ".escapeshellarg($_SERVER['DOCUMENT_ROOT'].$_SERVER['REQUEST_URI']);
              echo `$fixer`;
            ?>
            </h3>

            <footer>
                <hr />

                <p>
                    <span class="no_wrap">Better Things Financial Partners, LLC.</span>&nbsp;&nbsp;|&nbsp;
                    <span class="no_wrap">Phone: 803-622-3868</span>&nbsp;&nbsp;|&nbsp;
                    <span class="no_wrap">Email: <a href="mailto:chipestes@betterthingsfp.com">chipestes@betterthingsfp.com</a></span>
                </p>

                <hr />

            </footer>
        </div> <!-- /container -->

        <div id="copyright">
            &copy; 2015 Better Things Financial Partners, LLC. All rights reserved.
        </div>
		<div class="shadow bottom"></div>
    </div>
</body>
</html>

